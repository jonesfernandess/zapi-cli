import { Command } from "commander";
import { ZapiClient } from "../client.js";
import { printResponse } from "../output.js";

export function registerWebhookCommands(program: Command): void {
  const cmd = program.command("webhook").description("Manage webhooks");

  cmd.command("set-url")
    .description("Set webhook URL for all events")
    .requiredOption("--value <url>", "Webhook URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/update-every-webhooks", { value: opts.value }),
        "Update Webhooks",
      );
    });

  cmd.command("notify-sent-by-me")
    .description("Toggle notifications for messages sent by you")
    .requiredOption("--value <bool>", "true to enable, false to disable")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/update-notify-sent-by-me", { value: opts.value === "true" }),
        "Notify Sent By Me",
      );
    });
}
