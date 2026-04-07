import { Command } from "commander";
import { ZapiClient, buildBody } from "../client.js";
import { printResponse } from "../output.js";

export function registerMessageCommands(program: Command): void {
  const cmd = program.command("message").description("Manage messages (delete, read, reply, react, forward, pin, edit)");

  cmd.command("delete")
    .description("Delete a message")
    .requiredOption("--message-id <id>", "Message ID")
    .requiredOption("--phone <number>", "Chat phone number")
    .requiredOption("--owner <bool>", "true if you sent the message, false otherwise")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/delete-message", {
          messageId: opts.messageId,
          phone: opts.phone,
          owner: opts.owner === "true",
        }),
        "Delete Message",
      );
    });

  cmd.command("read")
    .description("Mark a message as read")
    .requiredOption("--message-id <id>", "Message ID")
    .requiredOption("--phone <number>", "Chat phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/read-message", { messageId: opts.messageId, phone: opts.phone }),
        "Read Message",
      );
    });

  cmd.command("reply")
    .description("Reply to a message")
    .requiredOption("--phone <number>", "Chat phone number")
    .requiredOption("--message <text>", "Reply text")
    .requiredOption("--message-id <id>", "Message ID to reply to")
    .option("--reply-from <number>", "Reply from number")
    .action(async (opts) => {
      const client = new ZapiClient();
      const body = buildBody({
        phone: opts.phone,
        message: opts.message,
        messageId: opts.messageId,
        replyFrom: opts.replyFrom,
      });
      printResponse(await client.post("/reply-message", body), "Reply Message");
    });

  cmd.command("react")
    .description("React to a message with an emoji")
    .requiredOption("--phone <number>", "Chat phone number")
    .requiredOption("--message-id <id>", "Message ID")
    .requiredOption("--emoji <emoji>", "Reaction emoji")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-reaction", { phone: opts.phone, messageId: opts.messageId, emoji: opts.emoji }),
        "Send Reaction",
      );
    });

  cmd.command("remove-reaction")
    .description("Remove a reaction from a message")
    .requiredOption("--phone <number>", "Chat phone number")
    .requiredOption("--message-id <id>", "Message ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/remove-reaction", { phone: opts.phone, messageId: opts.messageId }),
        "Remove Reaction",
      );
    });

  cmd.command("forward")
    .description("Forward a message to another chat")
    .requiredOption("--phone <number>", "Destination phone number")
    .requiredOption("--message-id <id>", "Message ID to forward")
    .requiredOption("--conversation-from <number>", "Source conversation number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/forward-message", {
          phone: opts.phone,
          messageId: opts.messageId,
          conversationFrom: opts.conversationFrom,
        }),
        "Forward Message",
      );
    });

  cmd.command("pin")
    .description("Pin a message in a chat")
    .requiredOption("--phone <number>", "Chat phone number")
    .requiredOption("--message-id <id>", "Message ID")
    .requiredOption("--duration <days>", "Pin duration: 0, 7, or 30 days", parseInt)
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/pin-message", {
          phone: opts.phone,
          messageId: opts.messageId,
          duration: opts.duration,
        }),
        "Pin Message",
      );
    });

  cmd.command("edit-event")
    .description("Edit an event message")
    .requiredOption("--body <json>", "Event edit body as JSON")
    .action(async (opts) => {
      const client = new ZapiClient();
      let body: Record<string, unknown>;
      try {
        body = JSON.parse(opts.body) as Record<string, unknown>;
      } catch {
        console.error("Invalid JSON for --body");
        process.exit(1);
      }
      printResponse(await client.post("/edit-event", body), "Edit Event");
    });
}
