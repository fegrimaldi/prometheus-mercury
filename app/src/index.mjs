import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env" });

import express from "express";
import bodyParser from "body-parser";
import routeAlert from "./router.mjs";
import sendICloudEmail from "./icloudClient.mjs";
import { timeStamp } from "./utils.mjs";
const PORT = process.env.PORT || 9502;

const app = express();
app.use(bodyParser.json());

app.post("/slack-alert", async (req, res) => {
  const alerts = req.body.alerts || [];
  // console.log(alerts);

  for (const alert of alerts) {
    await routeAlert(alert);
  }

  res.sendStatus(200); // .send("Alerts routed");
});

app.post("/icloud-alert", async (req, res) => {
  const alerts = req.body.alerts || [];

  for (const alert of alerts) {
    await sendICloudEmail(alert);
  }

  res.sendStatus(200); // .send("iCloud emails sent");
});

// Automated health check
app.get("/health", (req, res) => {
  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.status(403);
});

app.listen(PORT, () =>
  console.log(`${timeStamp()} 🌐 Mercury Comms is up on port ${PORT}`)
);
