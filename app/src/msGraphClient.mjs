import { ConfidentialClientApplication } from "@azure/msal-node";
import axios from "axios";
import { timeStamp } from "./utils.mjs";

const {
  MS_CLIENT_ID,
  MS_CLIENT_SECRET,
  MS_TENANT_ID,
  MS_USERNAME,
  MS_EMAIL_TO,
} = process.env;

const msalConfig = {
  auth: {
    clientId: MS_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${MS_TENANT_ID}`,
    clientSecret: MS_CLIENT_SECRET,
  },
};

const msalClient = new ConfidentialClientApplication(msalConfig);

/**
 * Sends an email via Microsoft Graph API using client credentials.
 * @param {Object} alert - Alert object containing annotations and labels.
 * @param {string} [to=MS_EMAIL_TO] - Optional override for recipient email.
 */
async function sendMSGraphEmail(alert, to = MS_EMAIL_TO) {
  // Ensure all required environment variables are set.
  if (
    !MS_CLIENT_ID ||
    !MS_CLIENT_SECRET ||
    !MS_TENANT_ID ||
    !MS_USERNAME ||
    !to
  ) {
    console.error(
      `${timeStamp()} ❌ MS Graph environment variables are missing`
    );
    return;
  }

  // Extract values from the alert, with defaults.
  const summary = alert.annotations?.summary || "No summary";
  const description = alert.annotations?.description || "No description";
  const severity = alert.labels?.severity || "info";
  const alertname = alert.labels?.alertname || "Unknown Alert";
  const instance = alert.labels?.instance || "Unknown Instance";
  const startsAt = alert.startsAt || new Date().toISOString();

  try {
    // Acquire an access token using client credentials.
    const tokenResponse = await msalClient.acquireTokenByClientCredential({
      scopes: ["https://graph.microsoft.com/.default"],
    });
    const accessToken = tokenResponse.accessToken;

    // Build the email payload.
    const emailPayload = {
      message: {
        subject: `🔔 ${instance}: ${severity.toUpperCase()} - ${alertname}`,
        body: {
          contentType: "Text",
          content: `${instance} ${summary}\n\n${description}`,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
        from: {
          emailAddress: {
            address: MS_USERNAME,
          },
        },
      },
      saveToSentItems: "false",
    };

    // Send the email via the Microsoft Graph API.
    await axios.post(
      `https://graph.microsoft.com/v1.0/users/${MS_USERNAME}/sendMail`,
      emailPayload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`${timeStamp()} ✅ MS Graph email sent to ${to}: ${alertname}`);
  } catch (error) {
    console.error(
      `${timeStamp()} ❌ Failed to send MS Graph email:`,
      error.response?.data || error.message
    );
  }
}

export default sendMSGraphEmail;
