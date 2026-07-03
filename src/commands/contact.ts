import { Command } from "commander";
import { ZapiClient } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

export function registerContactCommands(program: Command): void {
  const cmd = program.command("contact").description("Manage contacts");

  cmd.command("list").description("List contacts").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/contacts"), "Contacts");
  });

  cmd.command("metadata")
    .description("Get contact metadata")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.get(`/contact/${opts.phone}`), "Contact Metadata");
    });

  cmd.command("profile-picture")
    .description("Get contact profile picture")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.get(`/profile-picture/${opts.phone}`), "Profile Picture");
    });

  cmd.command("phone-exists")
    .description("Check if a phone number has WhatsApp")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.get(`/phone-exists/${opts.phone}`), "Phone Exists");
    });

  cmd.command("phone-exists-batch")
    .description("Check multiple phone numbers for WhatsApp")
    .requiredOption("--phones <json>", "JSON array of phone numbers")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/phone-exists-batch", { phones: parseJsonArg(opts.phones) }),
        "Phone Exists Batch",
      );
    });

  cmd.command("block")
    .description("Block a contact")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/block-contact", { phone: opts.phone }), "Block Contact");
    });

  cmd.command("unblock")
    .description("Unblock a contact")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/unblock-contact", { phone: opts.phone }), "Unblock Contact");
    });

  cmd.command("report")
    .description("Report a contact")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/report-contact", { phone: opts.phone }), "Report Contact");
    });

  cmd.command("add")
    .description("Add contacts to address book")
    .requiredOption("--contacts <json>", "JSON array of {name, phone} objects")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/contacts", { contacts: parseJsonArg(opts.contacts) }),
        "Add Contacts",
      );
    });
}
