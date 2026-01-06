// Main Cloudflare Worker - API Gateway and LLM Orchestration

import { Env, SendMessageRequest } from "./types";
import { IncidentDurableObject } from "./incident";
import * as historyService from "./services/history";
import * as templateService from "./services/templates";
import { seedIncidents } from "./scripts/seed";

export { IncidentDurableObject };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = getCorsHeaders(request, env);

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (path === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create or get incident
    if (path === "/api/incident" && request.method === "POST") {
      const incidentId = crypto.randomUUID();
      // Get Durable Object ID from the UUID
      const id = env.INCIDENT.idFromName(incidentId);
      const stub = env.INCIDENT.get(id);
      
      // Initialize the incident by calling it
      await stub.fetch(new URL("/state", request.url));
      
      return new Response(JSON.stringify({ incidentId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get incident state
    if (path.startsWith("/api/incident/") && request.method === "GET") {
      const incidentId = path.split("/").pop();
      if (!incidentId) {
        return new Response("Invalid incident ID", {
          status: 400,
          headers: corsHeaders,
        });
      }

      const id = env.INCIDENT.idFromName(incidentId);
      const stub = env.INCIDENT.get(id);
      const response = await stub.fetch(new URL("/state", request.url));
      
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send message to incident
    if (path === "/api/message" && request.method === "POST") {
      try {
        const body = await request.json<SendMessageRequest>();
        const { incidentId, message } = body;

        if (!incidentId || !message) {
          return new Response("Missing incidentId or message", {
            status: 400,
            headers: corsHeaders,
          });
        }

        // Get Durable Object instance for this incident
        const id = env.INCIDENT.idFromName(incidentId);
        const stub = env.INCIDENT.get(id);

        // Forward request to Durable Object
        const doResponse = await stub.fetch(
          new URL("/message", request.url),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
          }
        );

        const data = await doResponse.json();
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Error processing message:", error);
        return new Response("Internal server error", {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // Get incident history
    if (path === "/api/history" && request.method === "GET") {
      const service = url.searchParams.get("service");
      const query = url.searchParams.get("query");
      
      let incidents;
      if (service) {
        incidents = await historyService.getIncidentsByService(env, service);
      } else if (query) {
        incidents = await historyService.searchIncidents(env, query);
      } else {
        incidents = await historyService.getRecentIncidents(env, 20);
      }
      
      return new Response(JSON.stringify({ incidents }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Get incident statistics (computed from KV history)
    if (path === "/api/analytics/stats" && request.method === "GET") {
      const incidents = await historyService.getRecentIncidents(env, 100);
      
      // Compute stats
      const stats = {
        total: incidents.length,
        bySeverity: {
          CRITICAL: incidents.filter(i => i.severity === "CRITICAL").length,
          HIGH: incidents.filter(i => i.severity === "HIGH").length,
          MEDIUM: incidents.filter(i => i.severity === "MEDIUM").length,
          LOW: incidents.filter(i => i.severity === "LOW").length,
        },
        byService: incidents.reduce((acc, i) => {
          acc[i.service] = (acc[i.service] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        last24Hours: incidents.filter(i => 
          i.completedAt > Date.now() - 24 * 60 * 60 * 1000
        ).length,
        last7Days: incidents.filter(i => 
          i.completedAt > Date.now() - 7 * 24 * 60 * 60 * 1000
        ).length,
      };
      
      return new Response(JSON.stringify(stats), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Get all templates
    if (path === "/api/templates" && request.method === "GET") {
      const templates = await templateService.getAllTemplates(env);
      
      return new Response(JSON.stringify({ templates }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Initialize templates (one-time setup)
    if (path === "/api/templates/init" && request.method === "POST") {
      await templateService.initializeTemplates(env);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Seed incidents with demo data
    if (path === "/api/seed" && request.method === "POST") {
      const incidentIds = await seedIncidents(env);
      
      return new Response(JSON.stringify({ 
        success: true, 
        count: incidentIds.length,
        message: `Seeded ${incidentIds.length} incidents` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Get similar incidents for a specific incident
    if (path.startsWith("/api/incident/") && path.endsWith("/similar") && request.method === "GET") {
      const parts = path.split("/");
      const incidentId = parts[3];
      
      if (!incidentId) {
        return new Response("Invalid incident ID", {
          status: 400,
          headers: corsHeaders,
        });
      }
      
      const id = env.INCIDENT.idFromName(incidentId);
      const stub = env.INCIDENT.get(id);
      const response = await stub.fetch(new URL("/similar", request.url));
      
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Get suggested template for a specific incident
    if (path.startsWith("/api/incident/") && path.endsWith("/template") && request.method === "GET") {
      const parts = path.split("/");
      const incidentId = parts[3];
      
      if (!incidentId) {
        return new Response("Invalid incident ID", {
          status: 400,
          headers: corsHeaders,
        });
      }
      
      const id = env.INCIDENT.idFromName(incidentId);
      const stub = env.INCIDENT.get(id);
      const response = await stub.fetch(new URL("/template", request.url));
      
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    // Export incident report
    if (path.startsWith("/api/incident/") && path.endsWith("/export") && request.method === "POST") {
      const parts = path.split("/");
      const incidentId = parts[3];
      
      if (!incidentId) {
        return new Response("Invalid incident ID", {
          status: 400,
          headers: corsHeaders,
        });
      }
      
      const { format } = await request.json<{ format: "json" | "md" }>();
      
      const id = env.INCIDENT.idFromName(incidentId);
      const stub = env.INCIDENT.get(id);
      const response = await stub.fetch(
        new URL("/export", request.url),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ format }),
        }
      );
      
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404, headers: corsHeaders });
  },
};

function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin") || "";
  const allowedOrigins = (
    env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:8787"
  ).split(",");

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (allowedOrigins.includes("*")) {
    headers["Access-Control-Allow-Origin"] = "*";
  }

  return headers;
}

