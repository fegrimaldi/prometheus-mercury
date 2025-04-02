import "dotenv/config";
import { config } from "dotenv";
config({ path: ".env" });

import express from "express";
import bodyParser from "body-parser";
import routeAlert from "./router.mjs";
import sendMSGraphEmail from "./msGraphClient.mjs";

import { timeStamp } from "./utils.mjs";

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

app.post("/msgraph-alert", async (req, res) => {
  const alerts = req.body.alerts || [];

  for (const alert of alerts) {
    await sendMSGraphEmail(alert);
  }

  res.sendStatus(200); // .send("MS Graph emails sent");
});

const PORT = process.env.PORT || 9502;
app.listen(PORT, () =>
  console.log(`${timeStamp()} 🌐 Mercury Comms is up on port ${PORT}`)
);
