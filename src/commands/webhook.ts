import { Command } from "commander";
import { ZapiClient } from "../client.js";
import { printResponse } from "../output.js";

export function registerWebhookCommands(program: Command): void {
  const cmd = program.command("webhook").description("Manage webhook event URLs");

  cmd.command("set-all")
    .alias("set-url")
    .description("Set all webhook events to the same URL")
    .requiredOption("--value <url>", "Webhook URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.put("/update-every-webhooks", { value: opts.value }), "Set All Webhooks");
    });

  cmd.command("on-send")
    .description("Set webhook URL for messages sent by you")
    .requiredOption("--value <url>", "Webhook URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.put("/update-webhook-on-send", { value: opts.value }), "Webhook On Send");
    });

  cmd.command("on-receive")
    .description("Set webhook URL for messages received")
    .requiredOption("--value <url>", "Webhook URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.put("/update-webhook-received", { value: opts.value }), "Webhook On Receive");
    });

  cmd.command("on-receive-self")
    .description("Set webhook URL for received messages including sent by me")
    .requiredOption("--value <url>", "Webhook URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.put("/update-webhook-received-sent-by-me", { value: opts.value }),
        "Webhook On Receive (Self)",
      );
    });

  cmd.command("on-disconnect")
    .description("Set webhook URL for disconnect events")
    .requiredOption("--value <url>", "Webhook URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.put("/update-webhook-on-disconnect", { value: opts.value }),
        "Webhook On Disconnect",
      );
    });

  cmd.command("on-message-status")
    .description("Set webhook URL for message status updates (sent/delivered/read)")
    .requiredOption("--value <url>", "Webhook URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.put("/update-webhook-message-status", { value: opts.value }),
        "Webhook Message Status",
      );
    });

  cmd.command("on-chat-status")
    .description("Set webhook URL for chat status updates")
    .requiredOption("--value <url>", "Webhook URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.put("/update-webhook-chat-status", { value: opts.value }),
        "Webhook Chat Status",
      );
    });

  cmd.command("on-connect")
    .description("Set webhook URL for connect events")
    .requiredOption("--value <url>", "Webhook URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.put("/update-webhook-on-connected", { value: opts.value }),
        "Webhook On Connect",
      );
    });

  cmd.command("notify-sent-by-me")
    .description("Toggle notifications for messages sent by you")
    .requiredOption("--value <bool>", "true to enable, false to disable")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.put("/update-notify-sent-by-me", { value: opts.value === "true" }),
        "Notify Sent By Me",
      );
    });
}
