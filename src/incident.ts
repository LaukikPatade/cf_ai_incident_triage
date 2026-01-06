// Durable Object for managing incident state and workflow

import {
  IncidentState,
  IncidentStage,
  IncidentSignals,
  Message,
  IntakeResponse,
  DiagnosisResponse,
  Env,
} from "./types";
import { generateIntakePrompt, generateDiagnosisPrompt } from "./prompts";
import * as historyService from "./services/history";
import * as vectorService from "./services/vectorize";
import * as analyticsService from "./services/analytics";
import * as notificationService from "./services/notifications";
import * as reportService from "./services/reports";
import * as templateService from "./services/templates";

export class IncidentDurableObject {
  private state: DurableObjectState;
  private env: Env;
  private incident: IncidentState | null = null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Initialize incident state if not exists
    if (!this.incident) {
      this.incident = await this.state.storage.get<IncidentState>("incident");
      if (!this.incident) {
        const incidentId = this.state.id.toString();
        this.incident = this.createNewIncident(incidentId);
        await this.saveState();
        
        // Record incident creation in analytics
        await analyticsService.trackIncidentCreated(this.env, this.incident);
      }
    }

    if (path === "/message" && request.method === "POST") {
      const { message } = await request.json<{ message: string }>();
      return await this.handleMessage(message);
    }

    if (path === "/state" && request.method === "GET") {
      return new Response(JSON.stringify({ incident: this.incident }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (path === "/similar" && request.method === "GET") {
      const similar = await vectorService.findSimilarIncidents(this.env, this.incident, 5);
      return new Response(JSON.stringify({ similar }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (path === "/template" && request.method === "GET") {
      const template = await templateService.matchTemplate(this.env, this.incident.signals);
      return new Response(JSON.stringify({ template }), {
        headers: { "Content-Type": "application/json" },
      });
    }
    
    if (path === "/export" && request.method === "POST") {
      const { format } = await request.json<{ format: "json" | "md" }>();
      const diagnosis = (this.incident as any).diagnosis;
      
      if (!diagnosis) {
        return new Response(JSON.stringify({ error: "No diagnosis available" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      
      const reportKey = await reportService.exportIncidentReport(this.env, this.incident, diagnosis);
      const markdown = await reportService.generateReportMarkdown(this.incident, diagnosis);
      
      return new Response(JSON.stringify({ 
        key: reportKey, 
        markdown,
        url: `/reports/${reportKey}` 
      }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }

  private createNewIncident(incidentId: string): IncidentState {
    const now = Date.now();
    return {
      incidentId,
      stage: "INTAKE",
      signals: {},
      conversation: [
        {
          role: "assistant",
          content:
            "👋 I'm your AI incident triage assistant. I'll help you quickly assess and diagnose this incident. Let's start by understanding what's happening. Can you describe the issue you're seeing?",
          ts: now,
        },
      ],
      openQuestions: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  private async handleMessage(userMessage: string): Promise<Response> {
    if (!this.incident) {
      return new Response("Incident not initialized", { status: 500 });
    }

    // Add user message to conversation
    this.incident.conversation.push({
      role: "user",
      content: userMessage,
      ts: Date.now(),
    });

    let response: string;
    let diagnosis: DiagnosisResponse | undefined;

    try {
      switch (this.incident.stage) {
        case "INTAKE":
          const intakeResult = await this.handleIntakeStage(userMessage);
          // Check if intake result includes diagnosis (from immediate transition)
          if (typeof intakeResult === "object" && "response" in intakeResult) {
            response = intakeResult.response;
            diagnosis = intakeResult.diagnosis;
          } else {
            response = intakeResult;
          }
          break;
        case "DIAGNOSE":
          const diagnosisResult = await this.handleDiagnoseStage();
          response = diagnosisResult.response;
          diagnosis = diagnosisResult.diagnosis;
          break;
        case "RECOMMEND":
          response = "Incident triage complete. You can review the recommendations above.";
          break;
        default:
          response = "Unknown stage";
      }
    } catch (error) {
      console.error("Error handling message:", error);
      response =
        "I encountered an error processing your message. Please try again or rephrase your input.";
    }

    // Add assistant response to conversation
    this.incident.conversation.push({
      role: "assistant",
      content: response,
      ts: Date.now(),
    });

    this.incident.updatedAt = Date.now();
    await this.saveState();

    return new Response(
      JSON.stringify({
        incidentId: this.incident.incidentId,
        stage: this.incident.stage,
        response,
        signals: this.incident.signals,
        openQuestions: this.incident.openQuestions,
        diagnosis,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  private async handleIntakeStage(userMessage: string): Promise<string | { response: string; diagnosis: DiagnosisResponse }> {
    if (!this.incident) throw new Error("Incident not initialized");

    // Extract signals from user message using LLM
    const prompt = generateIntakePrompt(this.incident, userMessage);

    try {
      const aiResponse = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 1024,
      });

      const responseText = aiResponse.response || "";
      const intakeResponse = this.parseIntakeResponse(responseText);

      // Update signals with inferred data
      this.incident.signals = {
        ...this.incident.signals,
        ...intakeResponse.inferredSignals,
      };

      // Update open questions
      this.incident.openQuestions = intakeResponse.questions;

      // Check if we have enough information to move to diagnosis
      const hasEnoughInfo = this.hasMinimumSignals();
      const messageCount = this.incident.conversation.filter(m => m.role === "user").length;
      const signalCount = Object.keys(this.incident.signals).length;
      
      // Transition to DIAGNOSE if ANY of these conditions:
      // 1. We have minimum signals AND no more questions
      // 2. We have 4+ signals collected (good coverage)
      // 3. User has sent 3+ messages (enough back-and-forth)
      const shouldDiagnose = 
        (hasEnoughInfo && intakeResponse.questions.length === 0) ||
        (signalCount >= 4) ||
        (messageCount >= 3);

      if (shouldDiagnose) {
        // Transition to DIAGNOSE stage and run diagnosis immediately
        this.incident.stage = "DIAGNOSE";
        
        // Save state before running diagnosis
        await this.saveState();
        
        // Run diagnosis immediately instead of waiting for next message
        const diagnosisResult = await this.handleDiagnoseStage();
        return diagnosisResult; // Return full object with response and diagnosis
      }

      // Format response with questions
      let response = "";
      if (intakeResponse.shortHypothesis) {
        response += `💡 ${intakeResponse.shortHypothesis}\n\n`;
      }

      if (intakeResponse.questions.length > 0) {
        response += "To better understand the situation:\n";
        intakeResponse.questions.forEach((q, i) => {
          response += `${i + 1}. ${q}\n`;
        });
      } else {
        response += "I have enough information. Let me analyze this...";
        this.incident.stage = "DIAGNOSE";
        
        // Save state before running diagnosis
        await this.saveState();
        
        // Run diagnosis immediately
        const diagnosisResult = await this.handleDiagnoseStage();
        return diagnosisResult; // Return full object with response and diagnosis
      }

      return response;
    } catch (error) {
      console.error("LLM error during intake:", error);
      // Fallback questions
      return "Could you provide more details about:\n1. What service or component is affected?\n2. What symptoms are you observing?\n3. Is this affecting all users or a specific region?";
    }
  }

  private async handleDiagnoseStage(): Promise<{
    response: string;
    diagnosis: DiagnosisResponse;
  }> {
    if (!this.incident) throw new Error("Incident not initialized");

    const prompt = generateDiagnosisPrompt(this.incident);

    try {
      const aiResponse = await this.env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 2048,
      });

      const responseText = aiResponse.response || "";
      const diagnosis = this.parseDiagnosisResponse(responseText);
      
      // Store diagnosis in incident
      this.incident.diagnosis = diagnosis;

      // Transition to RECOMMEND stage
      const previousStage = this.incident.stage;
      this.incident.stage = "RECOMMEND";
      
      // Record stage transition
      await analyticsService.trackStageTransition(
        this.env,
        this.incident.incidentId,
        previousStage,
        "RECOMMEND",
        this.incident.signals.service || "unknown"
      );

      // Record incident completion
      await analyticsService.trackIncidentCompleted(
        this.env,
        this.incident,
        diagnosis
      );

      // Save to incident history
      await historyService.saveIncidentToHistory(
        this.env,
        this.incident,
        diagnosis
      );

      // Index in Vectorize for semantic search
      await vectorService.storeIncidentEmbedding(
        this.env,
        this.incident,
        diagnosis
      );

      // Send notifications for critical/high severity incidents
      await notificationService.sendCriticalIncidentNotification(
        this.env,
        this.incident,
        diagnosis
      );

      // Format response
      let response = `## 🔍 Incident Diagnosis\n\n`;
      response += `**Severity**: ${diagnosis.severity}\n\n`;

      response += `### Likely Root Causes:\n`;
      diagnosis.hypotheses.forEach((h, i) => {
        response += `${i + 1}. **${h.confidence}**: ${h.description}\n`;
        response += `   _${h.reasoning}_\n\n`;
      });

      response += `### Immediate Actions:\n`;
      diagnosis.nextSteps.immediate.forEach((step, i) => {
        response += `${i + 1}. ${step}\n`;
      });

      response += `\n### Deeper Investigation:\n`;
      diagnosis.nextSteps.deeper.forEach((step, i) => {
        response += `${i + 1}. ${step}\n`;
      });

      response += `\n### Monitor These Metrics:\n`;
      diagnosis.whatToMonitor.forEach((metric, i) => {
        response += `- ${metric}\n`;
      });

      return { response, diagnosis };
    } catch (error) {
      console.error("LLM error during diagnosis:", error);
      throw error;
    }
  }

  private parseIntakeResponse(text: string): IntakeResponse {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("Failed to parse intake response:", error);
    }

    // Fallback
    return {
      questions: ["Could you provide more details about the issue?"],
      inferredSignals: {},
      shortHypothesis: "",
    };
  }

  private parseDiagnosisResponse(text: string): DiagnosisResponse {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.error("Failed to parse diagnosis response:", error);
    }

    // Fallback
    return {
      severity: "MEDIUM",
      hypotheses: [
        {
          description: "Unable to determine root cause",
          confidence: "LOW",
          reasoning: "Insufficient information provided",
        },
      ],
      nextSteps: {
        immediate: ["Gather more information about the incident"],
        deeper: ["Review recent changes and logs"],
      },
      whatToMonitor: ["Error rates", "Response times", "Traffic patterns"],
    };
  }

  private hasMinimumSignals(): boolean {
    if (!this.incident) return false;
    const signals = this.incident.signals;
    return !!(signals.service && signals.symptom);
  }

  private async saveState(): Promise<void> {
    if (this.incident) {
      await this.state.storage.put("incident", this.incident);
    }
  }
}

