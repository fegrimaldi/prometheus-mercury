import axios from "axios";
import { timeStamp } from "./utils.mjs";

const SLACK_API_URL = "https://slack.com/api/chat.postMessage";
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const DEFAULT_CHANNEL = process.env.SLACK_DEFAULT_CHANNEL || "#chatops";

/**
 * Send a Slack message with formatted blocks
 * @param {Object} alert - Alertmanager alert object
 * @param {String} channelOverride - Optional override for channel routing
 */
async function sendSlackMessage(alert, channelOverride) {
  if (!SLACK_BOT_TOKEN) {
    console.error(`${timeStamp()} ❌ SLACK_BOT_TOKEN not set in environment`);
    return;
  }

  const summary = alert.annotations?.summary || "No summary";
  const description = alert.annotations?.description || "No description";
  const severity = alert.labels?.severity || "info";
  const alertname = alert.labels?.alertname || "Unknown Alert";
  const instance = alert.labels?.instance || "Unknown Instance";
  const startsAt = alert.startsAt || new Date().toISOString();
  const generatorUrl = alert?.generatorURL || "No URL";

  const payload = {
    channel: channelOverride || DEFAULT_CHANNEL,
    text: `${alertname}: ${instance}`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `⚠️  SilverWolf HQ: ${severity.toUpperCase()}`,
          emoji: true,
        },
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\n*Instance:* \`${instance}\`\n*Alert:* ${alertname}\n*Summary:* ${summary}\n*Description:* ${description}\n*URL:* ${generatorUrl}`,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Triggered at: ${startsAt}`,
          },
        ],
      },
    ],
  };

  try {
    const res = await axios.post(SLACK_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${SLACK_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      timeout: 5000,
    });

    if (!res.data.ok) {
      console.error(`${timeStamp()} ❌ Slack error:`, res.data);
    } else {
      console.log(
        `${timeStamp()} ✅ Slack message sent to ${
          payload.channel
        }: ${alertname}`
      );
    }
  } catch (err) {
    console.error(
      `${timeStamp()} ❌ Failed to send Slack message:`,
      err.message
    );
  }
}

export default sendSlackMessage;
