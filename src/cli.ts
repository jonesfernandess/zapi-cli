#!/usr/bin/env node

import { Command } from "commander";
import { execSync } from "child_process";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import * as clack from "@clack/prompts";

import { loadConfig, saveConfig, type ZapiConfig } from "./config.js";
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

const accent = chalk.hex("#98de62");
const dim = chalk.dim;
const zapiGradient = gradient(["#98de62", "#5cb85c"]);

function showBanner(): void {
  const banner = figlet.textSync("Z-API CLI", { horizontalLayout: "default" });
  console.log(zapiGradient(banner));
  console.log(dim("  Z-API WhatsApp API from the terminal\n"));
}

function getRepoDir(): string {
  const dir = new URL(".", import.meta.url).pathname.replace(/\/$/, "");
  if (dir.endsWith("/dist")) return dir.replace(/\/dist$/, "");
  return dir;
}

function updateFromMain(): void {
  const repoDir = getRepoDir();
  console.log("");
  console.log(`  ${accent("●")} Updating zapi-cli from ${chalk.green("main")}...`);
  console.log(dim(`  ${repoDir}`));
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

async function runSetupWizard(existing: ZapiConfig): Promise<void> {
  showBanner();

  console.log(accent("  Setup Wizard\n"));
  console.log(dim("  Configure your Z-API instance credentials.\n"));

  clack.intro(accent("zapi setup"));

  const instanceId = await clack.text({
    message: "Z-API Instance ID",
    placeholder: existing.instanceId || "your-instance-id",
    initialValue: existing.instanceId,
    validate: (v) => (!v ? "Instance ID is required" : undefined),
  });
  if (clack.isCancel(instanceId)) { clack.cancel("Setup cancelled."); process.exit(0); }

  const token = await clack.text({
    message: "Z-API Instance Token",
    placeholder: existing.token || "your-token",
    initialValue: existing.token,
    validate: (v) => (!v ? "Token is required" : undefined),
  });
  if (clack.isCancel(token)) { clack.cancel("Setup cancelled."); process.exit(0); }

  const securityToken = await clack.text({
    message: "Z-API Security Token (optional, for webhook validation)",
    placeholder: existing.securityToken || "your-client-token",
    initialValue: existing.securityToken,
  });
  if (clack.isCancel(securityToken)) { clack.cancel("Setup cancelled."); process.exit(0); }

  const cfg: ZapiConfig = {
    instanceId: instanceId as string,
    token: token as string,
    securityToken: (securityToken as string) || "",
  };

  saveConfig(cfg);

  clack.outro(accent("Configuration saved! Run `zapi` to start."));
}

async function startInteractive(): Promise<void> {
  showBanner();

  const config = loadConfig();
  if (!config.instanceId || !config.token) {
    console.log(chalk.yellow("  ⚠ No configuration found.\n"));
    await runSetupWizard(config);
    return;
  }

  console.log(dim(`  Instance: ${config.instanceId}\n`));

  const action = await clack.select({
    message: "What would you like to do?",
    options: [
      { value: "setup", label: "Setup", hint: "Reconfigure credentials" },
      { value: "update", label: "Update", hint: "Update zapi-cli to latest" },
      { value: "exit", label: "Exit" },
    ],
  });

  if (clack.isCancel(action) || action === "exit") {
    clack.cancel("Goodbye!");
    return;
  }

  if (action === "setup") {
    await runSetupWizard(config);
  } else if (action === "update") {
    updateFromMain();
  }
}

function bootCommander(): void {
  const program = new Command();

  program
    .name("zapi")
    .description("CLI tool for Z-API WhatsApp API")
    .version("1.0.0")
    .addHelpText("beforeAll", chalk.bold.hex("#98de62")("\n  Z-API CLI") + chalk.gray(" — WhatsApp API from the terminal\n"));

  // Setup command (so it shows in help)
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

// No args or "menu" -> interactive mode
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
