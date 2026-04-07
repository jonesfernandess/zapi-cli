import { Command } from "commander";
import { ZapiClient, buildBody } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

// Newsletter, Business, Status, Community, Queue, Privacy, Partner, Calls — combined for conciseness

export function registerNewsletterCommands(program: Command): void {
  const cmd = program.command("newsletter").description("Manage WhatsApp Channels/Newsletters");

  cmd.command("create")
    .description("Create a newsletter")
    .requiredOption("--name <name>", "Newsletter name")
    .option("--description <text>", "Newsletter description")
    .action(async (opts) => {
      const client = new ZapiClient();
      const body = buildBody({ name: opts.name, description: opts.description });
      printResponse(await client.post("/create-newsletter", body), "Create Newsletter");
    });

  cmd.command("update-picture")
    .description("Update newsletter picture")
    .requiredOption("--newsletter-id <id>", "Newsletter ID")
    .requiredOption("--picture <url>", "Picture URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/update-newsletter-picture", { newsletterId: opts.newsletterId, picture: opts.picture }),
        "Update Newsletter Picture",
      );
    });

  cmd.command("follow")
    .description("Follow a newsletter")
    .requiredOption("--newsletter-id <id>", "Newsletter ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/follow-newsletter", { newsletterId: opts.newsletterId }), "Follow Newsletter");
    });

  cmd.command("unfollow")
    .description("Unfollow a newsletter")
    .requiredOption("--newsletter-id <id>", "Newsletter ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/unfollow-newsletter", { newsletterId: opts.newsletterId }),
        "Unfollow Newsletter",
      );
    });

  cmd.command("delete")
    .description("Delete a newsletter")
    .requiredOption("--newsletter-id <id>", "Newsletter ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.delete("/delete-newsletter", { newsletterId: opts.newsletterId }),
        "Delete Newsletter",
      );
    });

  cmd.command("metadata")
    .description("Get newsletter metadata")
    .requiredOption("--newsletter-id <id>", "Newsletter ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.get(`/newsletter-metadata/${opts.newsletterId}`), "Newsletter Metadata");
    });

  cmd.command("list").description("List newsletters").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/newsletters"), "Newsletters");
  });
}

export function registerBusinessCommands(program: Command): void {
  const cmd = program.command("business").description("Business catalog, products, and tags");

  cmd.command("edit-product")
    .description("Edit/create a product")
    .requiredOption("--name <name>", "Product name")
    .requiredOption("--image <url>", "Product image URL")
    .option("--description <text>", "Product description")
    .option("--price <value>", "Product price")
    .option("--url <url>", "Product URL")
    .option("--is-hidden <bool>", "Hide product (true/false)")
    .action(async (opts) => {
      const client = new ZapiClient();
      const body = buildBody({
        name: opts.name,
        image: opts.image,
        description: opts.description,
        price: opts.price,
        url: opts.url,
        isHidden: opts.isHidden !== undefined ? opts.isHidden === "true" : undefined,
      });
      printResponse(await client.post("/edit-product", body), "Edit Product");
    });

  cmd.command("products").description("List products").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/products"), "Products");
  });

  cmd.command("delete-product")
    .description("Delete a product")
    .requiredOption("--product-id <id>", "Product ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.delete(`/delete-product/${opts.productId}`), "Delete Product");
    });

  cmd.command("tags").description("List tags").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/tags"), "Tags");
  });

  cmd.command("create-tag")
    .description("Create a tag")
    .requiredOption("--name <name>", "Tag name")
    .requiredOption("--color <color>", "Tag color")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/tags", { name: opts.name, color: opts.color }), "Create Tag");
    });

  cmd.command("delete-tag")
    .description("Delete a tag")
    .requiredOption("--tag-id <id>", "Tag ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.delete(`/tags/${opts.tagId}`), "Delete Tag");
    });

  cmd.command("tag-chat")
    .description("Tag a chat")
    .requiredOption("--phone <number>", "Phone number")
    .requiredOption("--tag-id <id>", "Tag ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/tag-chat", { phone: opts.phone, tagId: opts.tagId }),
        "Tag Chat",
      );
    });
}

export function registerStatusCommands(program: Command): void {
  const cmd = program.command("status").description("Manage WhatsApp Status/Stories");

  cmd.command("text")
    .description("Post a text status")
    .requiredOption("--message <text>", "Status text")
    .option("--background-color <color>", "Background color")
    .action(async (opts) => {
      const client = new ZapiClient();
      const body = buildBody({ message: opts.message, backgroundColor: opts.backgroundColor });
      printResponse(await client.post("/send-text-status", body), "Send Text Status");
    });

  cmd.command("image")
    .description("Post an image status")
    .requiredOption("--image <url>", "Image URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/send-image-status", { image: opts.image }), "Send Image Status");
    });

  cmd.command("video")
    .description("Post a video status")
    .requiredOption("--video <url>", "Video URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/send-video-status", { video: opts.video }), "Send Video Status");
    });
}

export function registerCommunityCommands(program: Command): void {
  const cmd = program.command("community").description("Manage WhatsApp Communities");

  cmd.command("create")
    .description("Create a community")
    .requiredOption("--name <name>", "Community name")
    .requiredOption("--phones <json>", "JSON array of phone numbers")
    .option("--description <text>", "Community description")
    .action(async (opts) => {
      const client = new ZapiClient();
      const body = buildBody({
        communityName: opts.name,
        communityDescription: opts.description,
        phones: parseJsonArg(opts.phones),
      });
      printResponse(await client.post("/create-community", body), "Create Community");
    });

  cmd.command("list").description("List communities").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/communities"), "Communities");
  });

  cmd.command("link-group")
    .description("Link groups to a community")
    .requiredOption("--community-id <id>", "Community ID")
    .requiredOption("--group-ids <json>", "JSON array of group IDs")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/link-group", {
          communityId: opts.communityId,
          groupIds: parseJsonArg(opts.groupIds),
        }),
        "Link Group",
      );
    });

  cmd.command("unlink-group")
    .description("Unlink groups from a community")
    .requiredOption("--community-id <id>", "Community ID")
    .requiredOption("--group-ids <json>", "JSON array of group IDs")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/unlink-group", {
          communityId: opts.communityId,
          groupIds: parseJsonArg(opts.groupIds),
        }),
        "Unlink Group",
      );
    });
}

export function registerQueueCommands(program: Command): void {
  const cmd = program.command("queue").description("Manage message queue");

  cmd.command("get").description("Get message queue").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/queue"), "Message Queue");
  });

  cmd.command("clear").description("Clear message queue").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.delete("/queue"), "Clear Queue");
  });
}

export function registerPrivacyCommands(program: Command): void {
  const cmd = program.command("privacy").description("Manage privacy settings");

  cmd.command("last-seen")
    .description("Set last seen visibility")
    .requiredOption("--value <scope>", "all, contacts, or none")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/last-seen", { value: opts.value }), "Last Seen");
    });

  cmd.command("profile-photo")
    .description("Set profile photo visibility")
    .requiredOption("--value <scope>", "all, contacts, or none")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/profile-photo-visualization", { value: opts.value }),
        "Profile Photo Visibility",
      );
    });

  cmd.command("online")
    .description("Toggle online visibility")
    .requiredOption("--value <bool>", "true to show online, false to hide")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/online-privacy", { value: opts.value === "true" }),
        "Online Privacy",
      );
    });

  cmd.command("read-receipts")
    .description("Toggle read receipts (blue ticks)")
    .requiredOption("--value <bool>", "true to enable, false to disable")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/read-receipts", { value: opts.value === "true" }),
        "Read Receipts",
      );
    });
}

export function registerPartnerCommands(program: Command): void {
  const cmd = program.command("partner").description("Partner/admin instance management");

  cmd.command("create-instance")
    .description("Create a new instance")
    .requiredOption("--name <name>", "Instance name")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/create-instance", { name: opts.name }), "Create Instance");
    });

  cmd.command("list-instances").description("List all instances").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/list-instances"), "List Instances");
  });

  cmd.command("sign-instance")
    .description("Sign/activate an instance")
    .requiredOption("--instance-id <id>", "Instance ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/sign-instance", { instanceId: opts.instanceId }), "Sign Instance");
    });

  cmd.command("cancel-instance")
    .description("Cancel/delete an instance")
    .requiredOption("--instance-id <id>", "Instance ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.delete(`/cancel-instance/${opts.instanceId}`), "Cancel Instance");
    });
}

export function registerCallsCommands(program: Command): void {
  const cmd = program.command("calls").description("WhatsApp calls");

  cmd.command("send")
    .description("Send a call to a contact")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/send-call", { phone: opts.phone }), "Send Call");
    });
}
