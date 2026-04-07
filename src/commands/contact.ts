import { Command } from "commander";
import { ZapiClient, buildBody } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

export function registerContactCommands(program: Command): void {
  const cmd = program.command("contact").description("Manage contacts");

  cmd.command("list").description("List contacts").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/contacts"), "Contacts");
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
    .requiredOption("--phones <json>", 'JSON array of phone numbers')
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

  cmd.command("add")
    .description("Add contacts")
    .requiredOption("--contacts <json>", 'JSON array of {name, phone} objects')
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/contacts", { contacts: parseJsonArg(opts.contacts) }),
        "Add Contacts",
      );
    });
}
