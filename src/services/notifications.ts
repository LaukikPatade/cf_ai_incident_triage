// Queue-based notification service

import { Env, IncidentState, DiagnosisResponse, NotificationMessage } from "../types";

export async function sendCriticalIncidentNotification(
  env: Env,
  incident: IncidentState,
  diagnosis: DiagnosisResponse
): Promise<void> {
  // Only send notifications for CRITICAL and HIGH severity
  if (diagnosis.severity !== "CRITICAL" && diagnosis.severity !== "HIGH") {
    return;
  }

  const notification: NotificationMessage = {
    type: "slack", // In production, this could be configurable
    incidentId: incident.incidentId,
    severity: diagnosis.severity,
    service: incident.signals.service || "unknown",
    summary: `${diagnosis.severity} incident in ${incident.signals.service}: ${incident.signals.symptom}`,
    timestamp: Date.now(),
  };

  try {
    await env.NOTIFICATION_QUEUE.send(notification);
    console.log(`Queued notification for ${incident.incidentId}`);
  } catch (error) {
    console.error("Error queuing notification:", error);
  }
}

// Queue consumer handler (add to worker.ts)
export async function handleNotificationQueue(
  batch: MessageBatch,
  env: Env
): Promise<void> {
  for (const message of batch.messages) {
    const notification = message.body as NotificationMessage;

    try {
      // In production, this would actually send to Slack/Email/PagerDuty
      console.log(`[NOTIFICATION] ${notification.severity} - ${notification.summary}`);

      // Simulate Slack webhook (in production, use actual webhook)
      // await sendToSlack(notification);

      message.ack();
    } catch (error) {
      console.error("Error processing notification:", error);
      message.retry();
    }
  }
}

// Helper function for actual Slack integration (placeholder)
async function sendToSlack(notification: NotificationMessage): Promise<void> {
  const payload = {
    text: `🚨 *${notification.severity} Incident*`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `🚨 ${notification.severity} Incident Alert`,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Service:*\n${notification.service}`,
          },
          {
            type: "mrkdwn",
            text: `*Severity:*\n${notification.severity}`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: notification.summary,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "View Incident",
            },
            url: `https://your-app.com/incidents/${notification.incidentId}`,
          },
        ],
      },
    ],
  };

  // In production: await fetch(SLACK_WEBHOOK_URL, { method: 'POST', body: JSON.stringify(payload) });
  console.log("Would send to Slack:", payload);
}
