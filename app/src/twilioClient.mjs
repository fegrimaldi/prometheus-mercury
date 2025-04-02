import twilio from "twilio";
import { timeStamp } from "./utils.mjs";

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_FROM,
  TWILIO_DEFAULT_TO,
} = process.env;

if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM) {
  console.warn(
    "⚠️ Twilio environment variables not fully set. SMS will be disabled."
  );
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

/**
 * Send an SMS message via Twilio
 * @param {Object} alert - Alertmanager alert object
 * @param {String} to - Optional override recipient
 */
async function sendSMS(alert, to = TWILIO_DEFAULT_TO) {
  if (!client || !to || !TWILIO_FROM) {
    console.warn(
      `${timeStamp()} ⚠️ Twilio client not configured or "to" number missing`
    );
    return;
  }

  const summary = alert.annotations?.summary || "No summary";
  const description = alert.annotations?.description || "No description";
  const severity = alert.labels?.severity || "info";
  const alertname = alert.labels?.alertname || "Unknown Alert";
  const instance = alert.labels?.instance || "Unknown Instance";
  const startsAt = alert.startsAt || timeStamp();

  const messageBody = `⚠️ [${severity.toUpperCase()}] ${alertname}:\nInstance:${instance} ${summary}\n${description}\nTriggered at: ${startsAt}`;

  try {
    const msg = await client.messages.create({
      body: messageBody,
      from: TWILIO_FROM,
      to,
    });

    console.log(`${timeStamp()} ✅ SMS sent to ${to}: SID ${msg.sid}`);
  } catch (err) {
    console.error(`${timeStamp()} ❌ Twilio SMS failed:`, err.message);
  }
}

export default sendSMS;
