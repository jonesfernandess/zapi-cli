import { Command } from "commander";
import { ZapiClient, buildBody } from "../client.js";
import { printResponse } from "../output.js";

export function registerInstanceCommands(program: Command): void {
  const cmd = program.command("instance").description("Manage WhatsApp instance");

  cmd.command("status").description("Check connection status").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/status"), "Instance Status");
  });

  cmd.command("restart").description("Restart instance").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.post("/restart"), "Restart");
  });

  cmd.command("disconnect").description("Disconnect from WhatsApp").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.post("/disconnect"), "Disconnect");
  });

  cmd.command("me").description("Get instance info/data").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/me"), "Instance Info");
  });

  cmd.command("device").description("Get device data").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/device"), "Device Data");
  });

  cmd.command("qr-code").description("Get QR code for connection").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/qr-code"), "QR Code");
  });

  cmd.command("profile-picture")
    .description("Update profile picture")
    .requiredOption("--value <url>", "Image URL or base64")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/profile-picture", { value: opts.value }), "Update Profile Picture");
    });

  cmd.command("profile-name")
    .description("Update profile name")
    .requiredOption("--value <name>", "New profile name")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/profile-name", { value: opts.value }), "Update Profile Name");
    });

  cmd.command("auto-read")
    .description("Toggle auto-read messages")
    .requiredOption("--value <bool>", "true to enable, false to disable")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/update-auto-read-message", { value: opts.value === "true" }),
        "Auto-Read Messages",
      );
    });

  cmd.command("reject-calls")
    .description("Toggle automatic call rejection")
    .requiredOption("--value <bool>", "true to enable, false to disable")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/update-call-reject-auto", { value: opts.value === "true" }),
        "Reject Calls",
      );
    });

  cmd.command("reject-call-message")
    .description("Set call rejection message")
    .requiredOption("--value <message>", "Rejection message text")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/update-call-reject-message", { value: opts.value }),
        "Call Reject Message",
      );
    });
}
