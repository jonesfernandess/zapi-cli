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
      const body = buildBody({ phone: opts.phone, image: opts.image, caption: opts.caption });
      printResponse(await client.post("/send-image", body), "Send Image");
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
      const body = buildBody({ phone: opts.phone, video: opts.video, caption: opts.caption });
      printResponse(await client.post("/send-video", body), "Send Video");
    });

  cmd.command("document")
    .description("Send a document")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--document <url>", "Document URL")
    .requiredOption("--ext <extension>", "File extension (pdf, docx, etc.)")
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
      const body = buildBody({
        phone: opts.phone,
        message: opts.message,
        image: opts.image,
        linkUrl: opts.linkUrl,
        title: opts.title,
        linkDescription: opts.linkDescription,
      });
      printResponse(await client.post("/send-link", body), "Send Link");
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
      const body = buildBody({
        phone: opts.phone,
        lat: opts.lat,
        lng: opts.lng,
        title: opts.title,
        address: opts.address,
      });
      printResponse(await client.post("/send-location", body), "Send Location");
    });

  cmd.command("contact")
    .description("Send a contact card")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--contact-name <name>", "Contact name")
    .requiredOption("--contact-phone <phone>", "Contact phone number")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-contact", {
          phone: opts.phone,
          contactName: opts.contactName,
          contactPhone: opts.contactPhone,
        }),
        "Send Contact",
      );
    });

  cmd.command("button-actions")
    .description("Send interactive button actions")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--buttons <json>", "Buttons JSON array")
    .option("--title <text>", "Title text")
    .option("--footer <text>", "Footer text")
    .action(async (opts) => {
      const client = new ZapiClient();
      const body = buildBody({
        phone: opts.phone,
        message: opts.message,
        title: opts.title,
        footer: opts.footer,
        buttons: parseJsonArg(opts.buttons),
      });
      printResponse(await client.post("/send-button-actions", body), "Send Button Actions");
    });

  cmd.command("option-list")
    .description("Send an option list")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--option-list <json>", "Option list JSON {title, options:[]}")
    .option("--title <text>", "Title text")
    .option("--footer <text>", "Footer text")
    .action(async (opts) => {
      const client = new ZapiClient();
      const body = buildBody({
        phone: opts.phone,
        message: opts.message,
        title: opts.title,
        footer: opts.footer,
        optionList: parseJsonArg(opts.optionList),
      });
      printResponse(await client.post("/send-option-list", body), "Send Option List");
    });

  cmd.command("button-pix")
    .description("Send a PIX payment button")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--pix-key <key>", "PIX key")
    .requiredOption("--pix-type <type>", "PIX type")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-button-pix", {
          phone: opts.phone,
          message: opts.message,
          pixKey: opts.pixKey,
          pixType: opts.pixType,
        }),
        "Send PIX Button",
      );
    });

  cmd.command("carousel")
    .description("Send a carousel of cards")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--cards <json>", "Cards JSON array")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-carousel", {
          phone: opts.phone,
          message: opts.message,
          cards: parseJsonArg(opts.cards),
        }),
        "Send Carousel",
      );
    });

  cmd.command("poll")
    .description("Send a poll")
    .requiredOption("--phone <number>", "Recipient phone number")
    .requiredOption("--message <text>", "Message text")
    .requiredOption("--poll <json>", "Poll JSON {name, values:[], selectableCount}")
    .action(async (opts) => {
      const client = new ZapiClient();
      printResponse(
        await client.post("/send-poll", {
          phone: opts.phone,
          message: opts.message,
          poll: parseJsonArg(opts.poll),
        }),
        "Send Poll",
      );
    });
}
