import nodemailer from "nodemailer";
import { timeStamp } from "./utils.mjs";

const { ICLOUD_EMAIL, ICLOUD_APP_PASSWORD, ICLOUD_EMAIL_TO, ICLOUD_FROM_NAME } =
  process.env;

const transporter = nodemailer.createTransport({
  host: "smtp.mail.me.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: ICLOUD_EMAIL,
    pass: ICLOUD_APP_PASSWORD,
  },
});

/**
 * Sends an email via iCloud+ SMTP (smtp.mail.me.com) using an app-specific password.
 * @param {Object} alert - Alert object containing annotations and labels.
 * @param {string} [to=ICLOUD_EMAIL_TO] - Optional override for recipient email.
 */
async function sendICloudEmail(alert, to = ICLOUD_EMAIL_TO) {
  // Ensure all required environment variables are set.
  if (!ICLOUD_EMAIL || !ICLOUD_APP_PASSWORD || !to) {
    console.error(
      `${timeStamp()} ❌ iCloud email environment variables are missing`
    );
    return;
  }

  // Extract values from the alert, with defaults.
  const summary = alert.annotations?.summary || "No summary";
  const description = alert.annotations?.description || "No description";
  const severity = alert.labels?.severity || "info";
  const alertname = alert.labels?.alertname || "Unknown Alert";
  const instance = alert.labels?.instance || "Unknown Instance";

  try {
    await transporter.sendMail({
      from: `"${ICLOUD_FROM_NAME || "Mercury Alerts"}" <${ICLOUD_EMAIL}>`,
      to,
      subject: `🔔 ${instance}: ${severity.toUpperCase()} - ${alertname}`,
      text: `${instance} ${summary}\n\n${description}`,
    });

    console.log(`${timeStamp()} ✅ iCloud email sent to ${to}: ${alertname}`);
  } catch (error) {
    console.error(
      `${timeStamp()} ❌ Failed to send iCloud email:`,
      error.message
    );
  }
}

export default sendICloudEmail;
