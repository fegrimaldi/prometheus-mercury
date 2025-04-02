# Prometheus Mercury

**Prometheus Mercury** is a lightweight, extendable alert-routing service designed to complement Prometheus Alertmanager. Like its mythological namesake, Mercury acts as the swift and intelligent messenger for your infrastructure alerts—ensuring they’re routed quickly and reliably across multiple communication channels.

## ✨ Features

- 📢 **Slack Integration** — Sends rich, block-formatted messages to Slack channels.
- 📬 **Microsoft Graph Email** — Sends emails using the Microsoft Graph API with secure MSAL authentication.
- 📩 **Google API Email** — Send alerts via Gmail API (optional module).
- 📱 **Twilio SMS Alerts** — Sends text messages for critical alerts using Twilio.
- 🧩 **Modular Architecture** — Easily extendable to support more protocols or destinations.

## 🧭 Overview

Prometheus Mercury is not a replacement for Alertmanager—it's a powerful **outbound communications supplement** that:

- Receives webhook alerts from Prometheus Alertmanager.
- Routes alerts to the correct channel based on severity and rules.
- Sends messages across Slack, Email (MS or Google), and SMS.

## 🐳 Containerized Deployment (Recommended)

You can build and run Mercury as part of your Prometheus Docker stack.

### 1. Build the Docker Image

```bash
docker build -t silverwolf/comms:latest .
```

### 2. Run the Container

```bash
docker run -p 9502:9502 --env-file .env silverwolf/comms:latest
```

> Ensure `.env` contains your credentials and routing details (see Configuration section).

## 🖥️ Systemd Deployment (Alternative)

For traditional server environments, Mercury can also be deployed as a system service.

### 1. Install Node.js (v20+ recommended)

Follow [Node.js installation instructions](https://nodejs.org/) or use your OS package manager.

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/fegrimaldi/prometheus-mercury.git
cd prometheus-mercury
npm install
```

### 3. Create a `.env` file in the root directory:

```env
PORT=9502

# Slack
SLACK_BOT_TOKEN=your-slack-token
SLACK_DEFAULT_CHANNEL=#chatops

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_FROM=+15555551234
TWILIO_DEFAULT_TO=+15555556789

# Microsoft Graph
MS_CLIENT_ID=your-ms-client-id
MS_CLIENT_SECRET=your-ms-client-secret
MS_TENANT_ID=your-ms-tenant-id
MS_USERNAME=your-email@domain.com
MS_EMAIL_TO=recipient@domain.com
```

### 4. Create a `systemd` service file (optional):

```ini
[Unit]
Description=Prometheus Mercury Alert Router
After=network.target

[Service]
ExecStart=/usr/bin/node /opt/apps/mercury/src/index.mjs
WorkingDirectory=/opt/apps/mercury
EnvironmentFile=/opt/apps/mercury/.env
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Then run:

```bash
sudo systemctl enable mercury
sudo systemctl start mercury
```

## 🚀 API Endpoints

| Endpoint              | Description                      |
| --------------------- | -------------------------------- |
| `POST /slack-alert`   | Send alerts to Slack             |
| `POST /msgraph-alert` | Send alerts via Microsoft email  |
| `POST /twilio-alert`  | Send SMS messages (if enabled)   |
| `POST /alert`         | Unified route to Slack/SMS/Email |

Use tools like **Postman** or **curl** to test with Alertmanager-style payloads.

## 🔧 Extending Mercury

Want to add new features? You can:

- Add new endpoints to `/src/router.mjs`
- Add new channel modules under `/src/`
- Implement custom retry/backoff, logging, or queueing

## 🧪 Testing

You can test each route individually or simulate Alertmanager payloads using a test script or webhook simulator.

## 📄 License

MIT License

---

Let Mercury carry your alerts when speed and reach matter most.
