import sendSlackMessage from "./slackClient.mjs";
import sendSMS from "./twilioClient.mjs";
import { timeStamp } from "./utils.mjs";

// import sendMSGraphEmail from "msGraphClient";
// import sendGoogleEmail from "googleClient";
// Add this map at the top of the file (outside the function)
const lastSentTimestamps = new Map();
const SMS_COOLDOWN_MS = 60 * 60 * 1000


/**
 * Main alert dispatcher
 * @param {Object} alert - Single alert object from Alertmanager
 */
async function routeAlert(alert) {
  const severity = alert.labels?.severity || "info";
  const alertname = alert.labels?.alertname || "GenericAlert";
  const device = alert.labels?.instance || "unknown";
  const key = `${alertname}:${device}`;

  console.log(`${timeStamp()} 📡 Routing alert: ${alertname} [${severity}]`);

  // Slack is always sent
  await sendSlackMessage(alert);

  if (severity === "critical") {
    const now = Date.now();
    const lastSent = lastSentTimestamps.get(key) || 0;

    if (now - lastSent > SMS_COOLDOWN_MS) {
      await sendSMS(alert);
      lastSentTimestamps.set(key, now);
    } else {
      console.log(`${timeStamp()} ⏳ SMS throttled for ${key}`);
    }
  }
}

export default routeAlert;
