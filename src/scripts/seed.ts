// Seeding script for demo data
import { Env } from "../types";

export interface SeedIncident {
  service: string;
  symptom: string;
  scope: "regional" | "global";
  recentDeploy: "yes" | "no";
  primaryError: string;
  environment: "prod" | "staging";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  resolution: string;
}

export const SEED_INCIDENTS: SeedIncident[] = [
  {
    service: "payment-service",
    symptom: "Database connection pool exhausted",
    scope: "global",
    recentDeploy: "yes",
    primaryError: "connection pool timeout",
    environment: "prod",
    severity: "CRITICAL",
    resolution: "Rolled back deployment v2.5.0, increased connection pool size to 200",
  },
  {
    service: "auth-service",
    symptom: "JWT token validation failures",
    scope: "global",
    recentDeploy: "yes",
    primaryError: "signature verification failed",
    environment: "prod",
    severity: "CRITICAL",
    resolution: "Reverted signing key configuration, redeployed v3.0.1",
  },
  {
    service: "checkout-api",
    symptom: "High latency in payment processing",
    scope: "regional",
    recentDeploy: "no",
    primaryError: "database query timeout",
    environment: "prod",
    severity: "HIGH",
    resolution: "Added index on orders.user_id, optimized N+1 queries",
  },
  {
    service: "inventory-service",
    symptom: "Stock count discrepancies",
    scope: "global",
    recentDeploy: "yes",
    primaryError: "race condition in update logic",
    environment: "prod",
    severity: "HIGH",
    resolution: "Implemented optimistic locking, deployed v4.2.1",
  },
  {
    service: "notification-worker",
    symptom: "Email delivery delays",
    scope: "global",
    recentDeploy: "no",
    primaryError: "queue backlog",
    environment: "prod",
    severity: "MEDIUM",
    resolution: "Scaled workers from 5 to 20, cleared backlog",
  },
  {
    service: "search-api",
    symptom: "Elasticsearch cluster red status",
    scope: "regional",
    recentDeploy: "no",
    primaryError: "disk space exhausted",
    environment: "prod",
    severity: "HIGH",
    resolution: "Cleaned old indices, increased disk capacity",
  },
  {
    service: "user-service",
    symptom: "Login page returning 503 errors",
    scope: "global",
    recentDeploy: "yes",
    primaryError: "out of memory",
    environment: "prod",
    severity: "CRITICAL",
    resolution: "Fixed memory leak in session handler, deployed hotfix v1.8.2",
  },
  {
    service: "analytics-pipeline",
    symptom: "Data processing lag",
    scope: "global",
    recentDeploy: "no",
    primaryError: "kafka consumer group lag",
    environment: "prod",
    severity: "MEDIUM",
    resolution: "Increased consumer parallelism, rebalanced partitions",
  },
  {
    service: "cdn-edge",
    symptom: "Cache hit rate dropped to 10%",
    scope: "regional",
    recentDeploy: "yes",
    primaryError: "cache invalidation bug",
    environment: "prod",
    severity: "MEDIUM",
    resolution: "Fixed cache key generation logic, deployed v2.1.3",
  },
  {
    service: "order-service",
    symptom: "Duplicate order creation",
    scope: "global",
    recentDeploy: "yes",
    primaryError: "idempotency key collision",
    environment: "prod",
    severity: "HIGH",
    resolution: "Updated idempotency key generation algorithm",
  },
  {
    service: "media-upload",
    symptom: "File upload failures",
    scope: "regional",
    recentDeploy: "no",
    primaryError: "S3 connection timeout",
    environment: "prod",
    severity: "MEDIUM",
    resolution: "Switched to regional S3 endpoint, added retry logic",
  },
  {
    service: "recommendation-engine",
    symptom: "ML model prediction errors",
    scope: "global",
    recentDeploy: "yes",
    primaryError: "feature vector mismatch",
    environment: "prod",
    severity: "LOW",
    resolution: "Rolled back model version, retrained with correct features",
  },
  {
    service: "webhook-dispatcher",
    symptom: "Webhook delivery failures",
    scope: "global",
    recentDeploy: "no",
    primaryError: "SSL certificate expired",
    environment: "prod",
    severity: "HIGH",
    resolution: "Renewed SSL certificates, updated certificate bundle",
  },
  {
    service: "reporting-service",
    symptom: "Report generation timeouts",
    scope: "global",
    recentDeploy: "yes",
    primaryError: "query too complex",
    environment: "prod",
    severity: "MEDIUM",
    resolution: "Optimized SQL queries, added materialized views",
  },
  {
    service: "cart-service",
    symptom: "Redis connection errors",
    scope: "regional",
    recentDeploy: "no",
    primaryError: "max connections reached",
    environment: "prod",
    severity: "HIGH",
    resolution: "Increased Redis max connections, scaled cluster",
  },
];

export async function seedIncidents(env: Env): Promise<string[]> {
  const incidentIds: string[] = [];
  const now = Date.now();

  for (let i = 0; i < SEED_INCIDENTS.length; i++) {
    const seed = SEED_INCIDENTS[i];
    
    // Generate incident ID
    const incidentId = `seed-${Date.now()}-${i}`;
    incidentIds.push(incidentId);

    // Calculate timestamps (spread over last 30 days)
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = now - (daysAgo * 24 * 60 * 60 * 1000) - Math.floor(Math.random() * 24 * 60 * 60 * 1000);
    const completedAt = createdAt + Math.floor(Math.random() * 60 * 60 * 1000); // 0-60 mins duration

    // Store in KV
    await env.INCIDENT_HISTORY.put(
      `incident:${incidentId}`,
      JSON.stringify({
        incidentId,
        service: seed.service,
        severity: seed.severity,
        symptom: seed.symptom,
        createdAt,
        completedAt,
        resolution: seed.resolution,
        signals: {
          service: seed.service,
          symptom: seed.symptom,
          scope: seed.scope,
          recentDeploy: seed.recentDeploy,
          primaryError: seed.primaryError,
          environment: seed.environment,
        },
        diagnosis: {
          severity: seed.severity,
          hypotheses: [
            {
              description: `Root cause related to ${seed.primaryError}`,
              confidence: "HIGH" as const,
              reasoning: `Based on error patterns and ${seed.recentDeploy === 'yes' ? 'recent deployment' : 'system metrics'}`,
            },
          ],
          nextSteps: {
            immediate: [seed.resolution],
            deeper: ["Monitor for recurrence", "Update runbooks"],
          },
          whatToMonitor: ["Error rates", "Response times", "Resource utilization"],
        },
        conversation: [
          {
            role: "user" as const,
            content: `${seed.service} is experiencing ${seed.symptom}`,
            ts: createdAt,
          },
          {
            role: "assistant" as const,
            content: `I've analyzed the incident. Severity: ${seed.severity}`,
            ts: createdAt + 5000,
          },
        ],
      }),
      {
        metadata: {
          service: seed.service,
          severity: seed.severity,
          timestamp: completedAt,
        },
      }
    );

    // Update service index
    const serviceKey = `service:${seed.service}`;
    const existingList = (await env.INCIDENT_HISTORY.get(serviceKey, "json")) as string[] || [];
    existingList.unshift(incidentId);
    await env.INCIDENT_HISTORY.put(serviceKey, JSON.stringify(existingList.slice(0, 50)));
  }

  return incidentIds;
}

