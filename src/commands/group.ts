import { Command } from "commander";
import { ZapiClient, buildBody } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

export function registerGroupCommands(program: Command): void {
  const cmd = program.command("group").description("Manage WhatsApp groups");

  cmd.command("list").description("List all groups").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/groups"), "Groups");
  });

  cmd.command("create")
    .description("Create a new group")
    .requiredOption("--name <name>", "Group name")
    .requiredOption("--phones <json>", 'JSON array of phone numbers')
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/create-group", { groupName: opts.name, phones: parseJsonArg(opts.phones) }),
        "Create Group",
      );
    });

  cmd.command("update-name")
    .description("Update group name")
    .requiredOption("--group-id <id>", "Group ID")
    .requiredOption("--name <name>", "New group name")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/update-group-name", { groupId: opts.groupId, groupName: opts.name }),
        "Update Group Name",
      );
    });

  cmd.command("update-photo")
    .description("Update group photo")
    .requiredOption("--group-id <id>", "Group ID")
    .requiredOption("--photo <url>", "Photo URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/update-group-photo", { groupId: opts.groupId, groupPhoto: opts.photo }),
        "Update Group Photo",
      );
    });

  cmd.command("add-participant")
    .description("Add participants to a group")
    .requiredOption("--group-id <id>", "Group ID")
    .requiredOption("--phones <json>", "JSON array of phone numbers")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/add-participant", { groupId: opts.groupId, phones: parseJsonArg(opts.phones) }),
        "Add Participant",
      );
    });

  cmd.command("remove-participant")
    .description("Remove participants from a group")
    .requiredOption("--group-id <id>", "Group ID")
    .requiredOption("--phones <json>", "JSON array of phone numbers")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/remove-participant", { groupId: opts.groupId, phones: parseJsonArg(opts.phones) }),
        "Remove Participant",
      );
    });

  cmd.command("add-admin")
    .description("Promote participants to admin")
    .requiredOption("--group-id <id>", "Group ID")
    .requiredOption("--phones <json>", "JSON array of phone numbers")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/add-admin", { groupId: opts.groupId, phones: parseJsonArg(opts.phones) }),
        "Add Admin",
      );
    });

  cmd.command("remove-admin")
    .description("Demote admins to participants")
    .requiredOption("--group-id <id>", "Group ID")
    .requiredOption("--phones <json>", "JSON array of phone numbers")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/remove-admin", { groupId: opts.groupId, phones: parseJsonArg(opts.phones) }),
        "Remove Admin",
      );
    });

  cmd.command("leave")
    .description("Leave a group")
    .requiredOption("--group-id <id>", "Group ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/leave-group", { groupId: opts.groupId }), "Leave Group");
    });

  cmd.command("metadata")
    .description("Get group metadata")
    .requiredOption("--group-id <id>", "Group ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.get(`/group-metadata/${opts.groupId}`), "Group Metadata");
    });

  cmd.command("invitation-metadata")
    .description("Get metadata from an invite URL")
    .requiredOption("--invite-url <url>", "Invitation URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.get(`/group-invitation-metadata/${encodeURIComponent(opts.inviteUrl)}`),
        "Invitation Metadata",
      );
    });

  cmd.command("invitation-link")
    .description("Get invitation link for a group")
    .requiredOption("--group-id <id>", "Group ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.get(`/invitation-link/${opts.groupId}`), "Invitation Link");
    });
}
