import { Command } from "commander";
import { ZapiClient } from "../client.js";
import { printResponse } from "../output.js";

export function registerChatCommands(program: Command): void {
  const cmd = program.command("chat").description("Manage chats (list, read, archive, pin, mute, clear, delete)");

  cmd.command("list").description("List all chats").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/chats"), "Chats");
  });

  cmd.command("metadata")
    .description("Get chat metadata")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.get(`/chats/${opts.phone}`), "Chat Metadata");
    });

  cmd.command("read")
    .description("Mark a chat as read")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/read-chat", { phone: opts.phone }), "Read Chat");
    });

  cmd.command("archive")
    .description("Archive/unarchive a chat")
    .requiredOption("--phone <number>", "Phone number")
    .requiredOption("--value <bool>", "true to archive, false to unarchive")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/archive-chat", { phone: opts.phone, value: opts.value === "true" }),
        "Archive Chat",
      );
    });

  cmd.command("pin")
    .description("Pin/unpin a chat")
    .requiredOption("--phone <number>", "Phone number")
    .requiredOption("--value <bool>", "true to pin, false to unpin")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/pin-chat", { phone: opts.phone, value: opts.value === "true" }),
        "Pin Chat",
      );
    });

  cmd.command("mute")
    .description("Mute a chat")
    .requiredOption("--phone <number>", "Phone number")
    .requiredOption("--expiration <timestamp>", "Expiration timestamp", parseInt)
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/mute-chat", { phone: opts.phone, expiration: opts.expiration }),
        "Mute Chat",
      );
    });

  cmd.command("clear")
    .description("Clear a chat")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/clear-chat", { phone: opts.phone }), "Clear Chat");
    });

  cmd.command("delete")
    .description("Delete a chat")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/delete-chat", { phone: opts.phone }), "Delete Chat");
    });
}
