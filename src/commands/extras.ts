import { Command } from "commander";
import { ZapiClient, buildBody } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

// Newsletter, Business, Status, Community, Queue, Privacy, Partner, Calls, Label, Collection, BusinessProfile

export function registerNewsletterCommands(program: Command): void {
  const cmd = program.command("newsletter").description("Manage WhatsApp Channels/Newsletters");

  cmd.command("list").description("List newsletters").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/newsletters"), "Newsletters");
  });

  cmd.command("search")
    .description("Search public newsletters/channels")
    .requiredOption("--query <text>", "Search query")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/search-newsletters", { query: opts.query }), "Search Newsletters");
    });

  cmd.command("metadata")
    .description("Get newsletter metadata")
    .requiredOption("--newsletter-id <id>", "Newsletter ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.get(`/newsletter-metadata/${opts.newsletterId}`), "Newsletter Metadata");
    });

  cmd.command("create")
    .description("Create a newsletter/channel")
    .requiredOption("--name <name>", "Newsletter name")
    .option("--description <text>", "Newsletter description")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/create-newsletter", buildBody({ name: opts.name, description: opts.description })),
        "Create Newsletter",
      );
    });

  cmd.command("update-name")
    .description("Update newsletter name")
    .requiredOption("--newsletter-id <id>", "Newsletter ID")
    .requiredOption("--name <name>", "New name")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/update-newsletter-name", { newsletterId: opts.newsletterId, name: opts.name }),
        "Update Newsletter Name",
      );
    });

  cmd.command("update-description")
    .description("Update newsletter description")
    .requiredOption("--newsletter-id <id>", "Newsletter ID")
    .requiredOption("--description <text>", "New description")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/update-newsletter-description", { newsletterId: opts.newsletterId, description: opts.description }),
        "Update Newsletter Description",
      );
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
      printResponse(await client.put("/follow-newsletter", { newsletterId: opts.newsletterId }), "Follow Newsletter");
    });

  cmd.command("unfollow")
    .description("Unfollow a newsletter")
    .requiredOption("--newsletter-id <id>", "Newsletter ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.put("/unfollow-newsletter", { newsletterId: opts.newsletterId }), "Unfollow Newsletter");
    });

  cmd.command("mute")
    .description("Mute a newsletter")
    .requiredOption("--newsletter-id <id>", "Newsletter ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.put("/mute-newsletter", { newsletterId: opts.newsletterId }), "Mute Newsletter");
    });

  cmd.command("unmute")
    .description("Unmute a newsletter")
    .requiredOption("--newsletter-id <id>", "Newsletter ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.put("/unmute-newsletter", { newsletterId: opts.newsletterId }), "Unmute Newsletter");
    });

  cmd.command("delete")
    .description("Delete a newsletter")
    .requiredOption("--newsletter-id <id>", "Newsletter ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.delete("/delete-newsletter", { newsletterId: opts.newsletterId }), "Delete Newsletter");
    });
}

export function registerBusinessCommands(program: Command): void {
  const cmd = program.command("business").description("WhatsApp Business catalog and products");

  cmd.command("edit-product")
    .description("Create or edit a product")
    .requiredOption("--name <name>", "Product name")
    .requiredOption("--image <url>", "Product image URL")
    .option("--description <text>", "Product description")
    .option("--price <value>", "Product price")
    .option("--url <url>", "Product URL")
    .option("--is-hidden <bool>", "Hide product (true/false)")
    .action(async (opts) => {
      const client = new ZapiClient();
      const body = buildBody({
        name: opts.name, image: opts.image, description: opts.description,
        price: opts.price, url: opts.url,
        isHidden: opts.isHidden !== undefined ? opts.isHidden === "true" : undefined,
      });
      printResponse(await client.post("/edit-product", body), "Edit Product");
    });

  cmd.command("products").description("List all products").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/products"), "Products");
  });

  cmd.command("product")
    .description("Get product by ID")
    .requiredOption("--product-id <id>", "Product ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.get(`/product/${opts.productId}`), "Product");
    });

  cmd.command("products-by-phone")
    .description("Get products for a contact")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.get(`/products/${opts.phone}`), "Products By Phone");
    });

  cmd.command("delete-product")
    .description("Delete a product")
    .requiredOption("--product-id <id>", "Product ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.delete(`/delete-product/${opts.productId}`), "Delete Product");
    });

  cmd.command("tags").description("List business tags").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/tags"), "Tags");
  });

  cmd.command("create-tag")
    .description("Create a business tag")
    .requiredOption("--name <name>", "Tag name")
    .requiredOption("--color <color>", "Tag color")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/tags", { name: opts.name, color: opts.color }), "Create Tag");
    });

  cmd.command("delete-tag")
    .description("Delete a business tag")
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
      printResponse(await client.post("/tag-chat", { phone: opts.phone, tagId: opts.tagId }), "Tag Chat");
    });
}

export function registerLabelCommands(program: Command): void {
  const cmd = program.command("label").description("WhatsApp Business labels (etiquetas)");

  cmd.command("list").description("List all labels").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/labels"), "Labels");
  });

  cmd.command("colors").description("List available label colors").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/label-colors"), "Label Colors");
  });

  cmd.command("create")
    .description("Create a label")
    .requiredOption("--name <name>", "Label name")
    .requiredOption("--color <color>", "Label color")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/label", { name: opts.name, color: opts.color }), "Create Label");
    });

  cmd.command("edit")
    .description("Edit a label")
    .requiredOption("--label-id <id>", "Label ID")
    .requiredOption("--name <name>", "New name")
    .requiredOption("--color <color>", "New color")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post(`/label/${opts.labelId}`, { name: opts.name, color: opts.color }),
        "Edit Label",
      );
    });

  cmd.command("delete")
    .description("Delete a label")
    .requiredOption("--label-id <id>", "Label ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.delete(`/label/${opts.labelId}`), "Delete Label");
    });

  cmd.command("assign")
    .description("Assign labels to a chat")
    .requiredOption("--phone <number>", "Phone number")
    .requiredOption("--label-ids <json>", "JSON array of label IDs")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.put("/assign-label", { phone: opts.phone, labelIds: parseJsonArg(opts.labelIds) }),
        "Assign Labels",
      );
    });

  cmd.command("remove")
    .description("Remove labels from a chat")
    .requiredOption("--phone <number>", "Phone number")
    .requiredOption("--label-ids <json>", "JSON array of label IDs")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.put("/remove-label", { phone: opts.phone, labelIds: parseJsonArg(opts.labelIds) }),
        "Remove Labels",
      );
    });
}

export function registerCollectionCommands(program: Command): void {
  const cmd = program.command("collection").description("WhatsApp Business product collections");

  cmd.command("list").description("List collections").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/collections"), "Collections");
  });

  cmd.command("create")
    .description("Create a collection")
    .requiredOption("--name <name>", "Collection name")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/create-collection", { name: opts.name }), "Create Collection");
    });

  cmd.command("edit")
    .description("Edit a collection")
    .requiredOption("--collection-id <id>", "Collection ID")
    .requiredOption("--name <name>", "New name")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post(`/collection/${opts.collectionId}`, { name: opts.name }),
        "Edit Collection",
      );
    });

  cmd.command("delete")
    .description("Delete a collection")
    .requiredOption("--collection-id <id>", "Collection ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.delete(`/collection/${opts.collectionId}`), "Delete Collection");
    });

  cmd.command("products")
    .description("List products in a collection")
    .requiredOption("--collection-id <id>", "Collection ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.get(`/collection/${opts.collectionId}/products`), "Collection Products");
    });

  cmd.command("add-products")
    .description("Add products to a collection")
    .requiredOption("--collection-id <id>", "Collection ID")
    .requiredOption("--product-ids <json>", "JSON array of product IDs")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post(`/collection/${opts.collectionId}/products`, { productIds: parseJsonArg(opts.productIds) }),
        "Add Products to Collection",
      );
    });

  cmd.command("remove-products")
    .description("Remove products from a collection")
    .requiredOption("--collection-id <id>", "Collection ID")
    .requiredOption("--product-ids <json>", "JSON array of product IDs")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.delete(`/collection/${opts.collectionId}/products`, { productIds: parseJsonArg(opts.productIds) }),
        "Remove Products from Collection",
      );
    });
}

export function registerBusinessProfileCommands(program: Command): void {
  const cmd = program.command("business-profile").description("WhatsApp Business profile settings");

  cmd.command("description")
    .description("Update business description")
    .requiredOption("--value <text>", "Business description")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/business-description", { value: opts.value }), "Business Description");
    });

  cmd.command("email")
    .description("Update business email")
    .requiredOption("--value <email>", "Business email")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/business-email", { value: opts.value }), "Business Email");
    });

  cmd.command("address")
    .description("Update business address")
    .requiredOption("--value <address>", "Business address")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/business-address", { value: opts.value }), "Business Address");
    });

  cmd.command("websites")
    .description("Update business websites")
    .requiredOption("--websites <json>", "JSON array of website URLs")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/business-websites", { websites: parseJsonArg(opts.websites) }),
        "Business Websites",
      );
    });

  cmd.command("categories")
    .description("List available business categories")
    .action(async () => {
      const client = new ZapiClient();
      printResponse(await client.get("/business-categories"), "Business Categories");
    });

  cmd.command("assign-category")
    .description("Assign a business category")
    .requiredOption("--category-id <id>", "Category ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/assign-business-category", { categoryId: opts.categoryId }),
        "Assign Business Category",
      );
    });
}

export function registerStatusCommands(program: Command): void {
  const cmd = program.command("status").description("Manage WhatsApp Status/Stories");

  cmd.command("text")
    .description("Post a text status")
    .requiredOption("--message <text>", "Status text")
    .option("--background-color <color>", "Background color (e.g. #128C7E)")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-text-status", buildBody({ message: opts.message, backgroundColor: opts.backgroundColor })),
        "Send Text Status",
      );
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

  cmd.command("list").description("List communities").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/communities"), "Communities");
  });

  cmd.command("create")
    .description("Create a community")
    .requiredOption("--name <name>", "Community name")
    .requiredOption("--phones <json>", "JSON array of phone numbers")
    .option("--description <text>", "Community description")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/create-community", buildBody({
          communityName: opts.name, communityDescription: opts.description,
          phones: parseJsonArg(opts.phones),
        })),
        "Create Community",
      );
    });

  cmd.command("metadata")
    .description("Get community metadata")
    .requiredOption("--community-id <id>", "Community ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.get(`/community-metadata/${opts.communityId}`), "Community Metadata");
    });

  cmd.command("link-group")
    .description("Link groups to a community")
    .requiredOption("--community-id <id>", "Community ID")
    .requiredOption("--group-ids <json>", "JSON array of group IDs")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/link-group", { communityId: opts.communityId, groupIds: parseJsonArg(opts.groupIds) }),
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
        await client.post("/unlink-group", { communityId: opts.communityId, groupIds: parseJsonArg(opts.groupIds) }),
        "Unlink Group",
      );
    });

  cmd.command("add-participant")
    .description("Add participants to a community")
    .requiredOption("--community-id <id>", "Community ID")
    .requiredOption("--phones <json>", "JSON array of phone numbers")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/add-participant-community", { communityId: opts.communityId, phones: parseJsonArg(opts.phones) }),
        "Add Community Participant",
      );
    });

  cmd.command("remove-participant")
    .description("Remove participants from a community")
    .requiredOption("--community-id <id>", "Community ID")
    .requiredOption("--phones <json>", "JSON array of phone numbers")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/remove-participant-community", { communityId: opts.communityId, phones: parseJsonArg(opts.phones) }),
        "Remove Community Participant",
      );
    });

  cmd.command("promote-admin")
    .description("Promote participants to community admin")
    .requiredOption("--community-id <id>", "Community ID")
    .requiredOption("--phones <json>", "JSON array of phone numbers")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/add-admin-community", { communityId: opts.communityId, phones: parseJsonArg(opts.phones) }),
        "Promote Community Admin",
      );
    });

  cmd.command("remove-admin")
    .description("Demote community admins")
    .requiredOption("--community-id <id>", "Community ID")
    .requiredOption("--phones <json>", "JSON array of phone numbers")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/remove-admin-community", { communityId: opts.communityId, phones: parseJsonArg(opts.phones) }),
        "Remove Community Admin",
      );
    });

  cmd.command("settings")
    .description("Update community settings")
    .requiredOption("--community-id <id>", "Community ID")
    .option("--message-admin <bool>", "Only admins can send messages (true/false)")
    .action(async (opts) => {
      const client = new ZapiClient();
      const body = buildBody({
        communityId: opts.communityId,
        messageAdmin: opts.messageAdmin !== undefined ? opts.messageAdmin === "true" : undefined,
      });
      printResponse(await client.post("/community-settings", body), "Community Settings");
    });

  cmd.command("reset-invite")
    .description("Reset community invite link")
    .requiredOption("--community-id <id>", "Community ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/reset-invitation-link-community", { communityId: opts.communityId }),
        "Reset Community Invite",
      );
    });

  cmd.command("delete")
    .description("Delete a community")
    .requiredOption("--community-id <id>", "Community ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.delete("/delete-community", { communityId: opts.communityId }), "Delete Community");
    });
}

export function registerQueueCommands(program: Command): void {
  const cmd = program.command("queue").description("Manage message queue");

  cmd.command("get").description("Get message queue").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/queue"), "Message Queue");
  });

  cmd.command("clear").description("Clear all queued messages").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.delete("/queue"), "Clear Queue");
  });

  cmd.command("delete-item")
    .description("Remove a specific message from the queue")
    .requiredOption("--message-id <id>", "Message ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.delete(`/queue/${opts.messageId}`), "Delete Queue Item");
    });
}

export function registerPrivacyCommands(program: Command): void {
  const cmd = program.command("privacy").description("Manage privacy settings");

  cmd.command("blocked-list").description("List blocked contacts").action(async () => {
    const client = new ZapiClient();
    printResponse(await client.get("/blocked-contacts"), "Blocked Contacts");
  });

  cmd.command("last-seen")
    .description("Set last seen visibility (all | contacts | none)")
    .requiredOption("--value <scope>", "all | contacts | none")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/last-seen", { value: opts.value }), "Last Seen");
    });

  cmd.command("profile-photo")
    .description("Set profile photo visibility (all | contacts | none)")
    .requiredOption("--value <scope>", "all | contacts | none")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/profile-photo-visualization", { value: opts.value }), "Profile Photo Visibility");
    });

  cmd.command("about")
    .description("Set profile description/bio visibility (all | contacts | none)")
    .requiredOption("--value <scope>", "all | contacts | none")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/about-privacy", { value: opts.value }), "About Visibility");
    });

  cmd.command("group-permission")
    .description("Set who can add you to groups (all | contacts | none)")
    .requiredOption("--value <scope>", "all | contacts | none")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/groups-privacy", { value: opts.value }), "Group Add Permission");
    });

  cmd.command("online")
    .description("Toggle online visibility")
    .requiredOption("--value <bool>", "true to show online, false to hide")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/online-privacy", { value: opts.value === "true" }), "Online Privacy");
    });

  cmd.command("read-receipts")
    .description("Toggle read receipts (blue ticks)")
    .requiredOption("--value <bool>", "true to enable, false to disable")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/read-receipts", { value: opts.value === "true" }), "Read Receipts");
    });

  cmd.command("message-duration")
    .description("Set default disappearing messages duration")
    .requiredOption("--value <duration>", "off | 24hours | 7days | 90days")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/temporary-messages", { value: opts.value }), "Message Duration");
    });
}

export function registerPartnerCommands(program: Command): void {
  const cmd = program.command("partner").description("Partner/admin instance management");

  cmd.command("create-instance")
    .description("Create a new instance (partner only)")
    .requiredOption("--name <name>", "Instance name")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("https://api.z-api.io/instances/integrator/on-demand", { name: opts.name }),
        "Create Instance",
      );
    });

  cmd.command("list-instances")
    .description("List all instances (partner only)")
    .option("--page <n>", "Page number", "1")
    .option("--page-size <n>", "Results per page", "50")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.get(`https://api.z-api.io/instances?page=${opts.page}&pageSize=${opts.pageSize}`),
        "List Instances",
      );
    });

  cmd.command("sign-instance")
    .description("Sign/activate an instance (partner only)")
    .requiredOption("--instance-id <id>", "Instance ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/integrator/on-demand/subscription", { instanceId: opts.instanceId }),
        "Sign Instance",
      );
    });

  cmd.command("cancel-instance")
    .description("Cancel/delete an instance (partner only)")
    .requiredOption("--instance-id <id>", "Instance ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/integrator/on-demand/cancel", { instanceId: opts.instanceId }),
        "Cancel Instance",
      );
    });
}

export function registerCallsCommands(program: Command): void {
  const cmd = program.command("calls").description("WhatsApp calls");

  cmd.command("send")
    .description("Initiate a call to a contact")
    .requiredOption("--phone <number>", "Phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/send-call", { phone: opts.phone }), "Send Call");
    });
}
