import { Command } from "commander";
import { ZapiClient, buildBody } from "../client.js";
import { printResponse, parseJsonArg } from "../output.js";

export function registerSendCommands(program: Command): void {
  const cmd = program.command("send").description("Send messages (text, media, location, contact, etc.)");

  cmd.command("text")
    .description("Send a text message")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/send-text", { phone: opts.phone, message: opts.message }), "Send Text");
    });

  cmd.command("image")
    .description("Send an image")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--image <url>", "Image URL")
    .option("--caption <text>", "Image caption")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/send-image", buildBody({ phone: opts.phone, image: opts.image, caption: opts.caption })), "Send Image");
    });

  cmd.command("sticker")
    .description("Send a sticker")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--sticker <url>", "Sticker URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/send-sticker", { phone: opts.phone, sticker: opts.sticker }), "Send Sticker");
    });

  cmd.command("gif")
    .description("Send a GIF")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--gif <url>", "GIF URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/send-gif", { phone: opts.phone, gif: opts.gif }), "Send GIF");
    });

  cmd.command("audio")
    .description("Send an audio file")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--audio <url>", "Audio URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/send-audio", { phone: opts.phone, audio: opts.audio }), "Send Audio");
    });

  cmd.command("video")
    .description("Send a video")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--video <url>", "Video URL")
    .option("--caption <text>", "Video caption")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/send-video", buildBody({ phone: opts.phone, video: opts.video, caption: opts.caption })), "Send Video");
    });

  cmd.command("ptv")
    .description("Send a PTV (push-to-talk video)")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--video <url>", "Video URL")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(await client.post("/send-ptv", { phone: opts.phone, video: opts.video }), "Send PTV");
    });

  cmd.command("document")
    .description("Send a document")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--document <url>", "Document URL")
    .requiredOption("--ext <extension>", "File extension (pdf, docx, xlsx, etc.)")
    .option("--file-name <name>", "File name")
    .action(async (opts) => {
      const client = new ZapiClient();
      const body = buildBody({ phone: opts.phone, document: opts.document, fileName: opts.fileName });
      printResponse(await client.post(`/send-document/${opts.ext}`, body), "Send Document");
    });

  cmd.command("link")
    .description("Send a link with preview")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--link-url <url>", "Link URL")
    .option("--image <url>", "Preview image URL")
    .option("--title <text>", "Link title")
    .option("--link-description <text>", "Link description")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-link", buildBody({
          phone: opts.phone, message: opts.message, image: opts.image,
          linkUrl: opts.linkUrl, title: opts.title, linkDescription: opts.linkDescription,
        })),
        "Send Link",
      );
    });

  cmd.command("location")
    .description("Send a geographic location")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--lat <latitude>", "Latitude")
    .requiredOption("--lng <longitude>", "Longitude")
    .option("--title <text>", "Location title")
    .option("--address <text>", "Location address")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-location", buildBody({ phone: opts.phone, lat: opts.lat, lng: opts.lng, title: opts.title, address: opts.address })),
        "Send Location",
      );
    });

  cmd.command("contact")
    .description("Send a contact card")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--contact-name <name>", "Contact name")
    .requiredOption("--contact-phone <phone>", "Contact phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-contact", { phone: opts.phone, contactName: opts.contactName, contactPhone: opts.contactPhone }),
        "Send Contact",
      );
    });

  cmd.command("contacts")
    .description("Send multiple contacts")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--contacts <json>", 'JSON array of {name, phone} objects')
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-contacts", { phone: opts.phone, contacts: parseJsonArg(opts.contacts) }),
        "Send Contacts",
      );
    });

  cmd.command("button-actions")
    .description("Send text with action buttons")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--buttons <json>", 'JSON array of {label, id?} objects')
    .option("--title <text>", "Title text")
    .option("--footer <text>", "Footer text")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-button-actions", buildBody({
          phone: opts.phone, message: opts.message, title: opts.title,
          footer: opts.footer, buttons: parseJsonArg(opts.buttons),
        })),
        "Send Button Actions",
      );
    });

  cmd.command("button-text")
    .description("Send a list message with a button to open it")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--button-text <text>", "Button label to open the list")
    .requiredOption("--section-list <json>", 'JSON array of {title, rows:[{title, description?, rowId?}]}')
    .option("--title <text>", "Title text")
    .option("--footer <text>", "Footer text")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-button-list", buildBody({
          phone: opts.phone, message: opts.message, buttonText: opts.buttonText,
          sectionList: parseJsonArg(opts.sectionList), title: opts.title, footer: opts.footer,
        })),
        "Send Button List",
      );
    });

  cmd.command("button-image")
    .description("Send an image with action buttons")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--image <url>", "Image URL")
    .requiredOption("--buttons <json>", 'JSON array of {label, id?} objects')
    .option("--title <text>", "Title text")
    .option("--footer <text>", "Footer text")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-image-actions", buildBody({
          phone: opts.phone, message: opts.message, image: opts.image,
          buttons: parseJsonArg(opts.buttons), title: opts.title, footer: opts.footer,
        })),
        "Send Button Image",
      );
    });

  cmd.command("button-video")
    .description("Send a video with action buttons")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--video <url>", "Video URL")
    .requiredOption("--buttons <json>", 'JSON array of {label, id?} objects')
    .option("--title <text>", "Title text")
    .option("--footer <text>", "Footer text")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-video-actions", buildBody({
          phone: opts.phone, message: opts.message, video: opts.video,
          buttons: parseJsonArg(opts.buttons), title: opts.title, footer: opts.footer,
        })),
        "Send Button Video",
      );
    });

  cmd.command("button-otp")
    .description("Send an OTP button message")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--otp-code <code>", "OTP code")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-button-otp", { phone: opts.phone, message: opts.message, otpCode: opts.otpCode }),
        "Send OTP Button",
      );
    });

  cmd.command("option-list")
    .description("Send an option list")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--option-list <json>", 'Option list JSON {title, options:[{title,description?,optionId?}]}')
    .option("--title <text>", "Title text")
    .option("--footer <text>", "Footer text")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-option-list", buildBody({
          phone: opts.phone, message: opts.message, title: opts.title,
          footer: opts.footer, optionList: parseJsonArg(opts.optionList),
        })),
        "Send Option List",
      );
    });

  cmd.command("button-pix")
    .description("Send a PIX payment button")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--pix-key <key>", "PIX key")
    .requiredOption("--pix-type <type>", "PIX type: CPF | CNPJ | PHONE | EMAIL | EVP")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-button-pix", { phone: opts.phone, message: opts.message, pixKey: opts.pixKey, pixType: opts.pixType }),
        "Send PIX Button",
      );
    });

  cmd.command("carousel")
    .description("Send a carousel of cards")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--cards <json>", "JSON array of card objects")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-carousel", { phone: opts.phone, message: opts.message, cards: parseJsonArg(opts.cards) }),
        "Send Carousel",
      );
    });

  cmd.command("poll")
    .description("Send a poll")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--poll <json>", 'Poll JSON {name, values:[], selectableCount?}')
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-poll", { phone: opts.phone, message: opts.message, poll: parseJsonArg(opts.poll) }),
        "Send Poll",
      );
    });

  cmd.command("poll-vote")
    .description("Vote on a poll")
    .requiredOption("--phone <number>", "Chat phone number")
    .requiredOption("--message-id <id>", "Poll message ID")
    .requiredOption("--poll-votes <json>", "JSON array of selected option values")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-poll-vote", { phone: opts.phone, messageId: opts.messageId, pollVotes: parseJsonArg(opts.pollVotes) }),
        "Send Poll Vote",
      );
    });

  cmd.command("product")
    .description("Send a product from catalog")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--product-id <id>", "Product ID")
    .option("--catalog-id <id>", "Catalog ID")
    .option("--message <text>", "Optional message")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-product", buildBody({ phone: opts.phone, productId: opts.productId, catalogId: opts.catalogId, message: opts.message })),
        "Send Product",
      );
    });

  cmd.command("catalog")
    .description("Send a product catalog")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--catalog-id <id>", "Catalog ID")
    .option("--message <text>", "Optional message")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-catalog", buildBody({ phone: opts.phone, catalogId: opts.catalogId, message: opts.message })),
        "Send Catalog",
      );
    });

  cmd.command("event")
    .description("Send an event message")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--subject <text>", "Event subject/title")
    .requiredOption("--start-date <datetime>", "Start date (ISO 8601, e.g. 2026-06-01T10:00:00)")
    .requiredOption("--end-date <datetime>", "End date (ISO 8601)")
    .option("--description <text>", "Event description")
    .option("--location <text>", "Event location")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-event", buildBody({
          phone: opts.phone, subject: opts.subject, description: opts.description,
          startDate: opts.startDate, endDate: opts.endDate, location: opts.location,
        })),
        "Send Event",
      );
    });

  cmd.command("reply-event")
    .description("Reply to an event (RSVP)")
    .requiredOption("--phone <number>", "Chat phone number")
    .requiredOption("--message-id <id>", "Event message ID")
    .requiredOption("--action <action>", "RSVP action: ACCEPTED | DECLINED | TENTATIVE")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/reply-event", { phone: opts.phone, messageId: opts.messageId, action: opts.action }),
        "Reply Event",
      );
    });

  cmd.command("order-approval")
    .description("Send an order approval message")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--order-id <id>", "Order ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-order-approval", { phone: opts.phone, orderId: opts.orderId }),
        "Send Order Approval",
      );
    });

  cmd.command("order-update")
    .description("Send an order status update")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--order-id <id>", "Order ID")
    .requiredOption("--status <status>", "Order status")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-order-status", { phone: opts.phone, orderId: opts.orderId, status: opts.status }),
        "Send Order Update",
      );
    });

  cmd.command("order-payment")
    .description("Send an order payment update")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--order-id <id>", "Order ID")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-order-payment", { phone: opts.phone, orderId: opts.orderId }),
        "Send Order Payment",
      );
    });
}
