#!/usr/bin/env node

import { Command } from "commander";
import { execSync } from "child_process";
import chalk from "chalk";

import { registerInstanceCommands } from "./commands/instance.js";
import { registerSendCommands } from "./commands/send.js";
import { registerMessageCommands } from "./commands/message.js";
import { registerChatCommands } from "./commands/chat.js";
import { registerGroupCommands } from "./commands/group.js";
import { registerContactCommands } from "./commands/contact.js";
import { registerWebhookCommands } from "./commands/webhook.js";
import {
  registerNewsletterCommands,
  registerBusinessCommands,
  registerStatusCommands,
  registerCommunityCommands,
  registerQueueCommands,
  registerPrivacyCommands,
  registerPartnerCommands,
  registerCallsCommands,
} from "./commands/extras.js";
import { startInteractive, runSetupWizard, loadConfig } from "./interactive.js";

const accent = chalk.hex("#98de62");

function getRepoDir(): string {
  const dir = new URL(".", import.meta.url).pathname.replace(/\/$/, "");
  if (dir.endsWith("/dist")) return dir.replace(/\/dist$/, "");
  return dir;
}

function updateFromMain(): void {
  const repoDir = getRepoDir();
  console.log("");
  console.log(`  ${accent("●")} Updating zapi-cli from ${chalk.green("main")}...`);
  console.log(chalk.dim(`  ${repoDir}`));
  console.log("");

  try {
    execSync("git fetch origin main", { cwd: repoDir, stdio: "inherit" });

    const status = execSync("git status --porcelain", { cwd: repoDir, encoding: "utf-8" }).trim();
    if (status) {
      console.log(chalk.yellow("\n  ⚠ Local changes detected. Stashing...\n"));
      execSync("git stash", { cwd: repoDir, stdio: "inherit" });
    }

    execSync("git pull origin main", { cwd: repoDir, stdio: "inherit" });

    console.log("");
    console.log(`  ${accent("●")} Installing dependencies...`);
    console.log("");
    execSync("npm install", { cwd: repoDir, stdio: "inherit" });

    console.log("");
    console.log(`  ${accent("●")} Building...`);
    console.log("");
    execSync("npm run build", { cwd: repoDir, stdio: "inherit" });

    console.log("");
    console.log(chalk.green("  ✓ zapi-cli updated successfully!"));
    console.log("");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(chalk.red(`\n  ✗ Update failed: ${message}\n`));
    process.exit(1);
  }
}

function bootCommander(): void {
  const program = new Command();

  program
    .name("zapi")
    .description("CLI tool for Z-API WhatsApp API")
    .version("1.0.0")
    .addHelpText("beforeAll", chalk.bold.hex("#98de62")("\n  Z-API CLI") + chalk.gray(" — WhatsApp API from the terminal\n"));

  program.command("setup").description("Run interactive setup wizard").action(async () => {
    const config = loadConfig();
    await runSetupWizard(config);
  });

  program.command("menu").description("Open interactive menu").action(async () => {
    await startInteractive();
  });

  program.command("update").alias("upgrade").description("Update zapi-cli to latest version").action(() => {
    updateFromMain();
  });

  // Register all command groups
  registerInstanceCommands(program);
  registerSendCommands(program);
  registerMessageCommands(program);
  registerChatCommands(program);
  registerGroupCommands(program);
  registerContactCommands(program);
  registerWebhookCommands(program);
  registerNewsletterCommands(program);
  registerBusinessCommands(program);
  registerStatusCommands(program);
  registerCommunityCommands(program);
  registerQueueCommands(program);
  registerPrivacyCommands(program);
  registerPartnerCommands(program);
  registerCallsCommands(program);

  program.parse();
}

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "menu") {
  startInteractive().catch(console.error);
} else if (args[0] === "setup" || args[0] === "onboard") {
  const config = loadConfig();
  runSetupWizard(config).catch(console.error);
} else if (args[0] === "update" || args[0] === "upgrade") {
  updateFromMain();
} else {
  bootCommander();
}
