import sendSlackMessage from "./slackClient.mjs";
import sendSMS from "./twilioClient.mjs";
import { timeStamp } from "./utils.mjs";

// import sendMSGraphEmail from "msGraphClient";
// import sendGoogleEmail from "googleClient";

/**
 * Main alert dispatcher
 * @param {Object} alert - Single alert object from Alertmanager
 */
async function routeAlert(alert) {
  const severity = alert.labels?.severity || "info";
  const alertname = alert.labels?.alertname || "GenericAlert";

  console.log(`${timeStamp()} 📡 Routing alert: ${alertname} [${severity}]`);

  // Slack is always sent (for now)
  await sendSlackMessage(alert);

  // 🔜 Example: Add routing logic
  if (severity === "critical") {
    await sendSMS(alert); // Twilio
    // await sendMSGraphEmail(alert);
  }

  // if (alertname.startsWith('user-')) {
  //   await sendGoogleEmail(alert);
  // }
}

export default routeAlert;
