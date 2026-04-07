import { config } from "dotenv";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { homedir } from "os";
import chalk from "chalk";

const CONFIG_DIR = join(homedir(), ".zapi-cli");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface ZapiConfig {
  instanceId: string;
  token: string;
  securityToken: string;
}

// Load .env from: CWD -> project root -> ~/.zapi-cli/
const envPaths = [
  join(process.cwd(), ".env"),
  join(import.meta.dirname, "..", ".env"),
  join(CONFIG_DIR, ".env"),
];

for (const p of envPaths) {
  if (existsSync(p)) {
    config({ path: p });
    break;
  }
}

// Also load from config.json if env vars are not set
function loadFromConfigJson(): void {
  if (!existsSync(CONFIG_FILE)) return;
  try {
    const data = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    if (data.instanceId && !process.env["ZAPI_INSTANCE_ID"]) {
      process.env["ZAPI_INSTANCE_ID"] = data.instanceId;
    }
    if (data.token && !process.env["ZAPI_TOKEN"]) {
      process.env["ZAPI_TOKEN"] = data.token;
    }
    if (data.securityToken && !process.env["ZAPI_SECURITY_TOKEN"]) {
      process.env["ZAPI_SECURITY_TOKEN"] = data.securityToken;
    }
  } catch {
    // ignore
  }
}

loadFromConfigJson();

function missingConfigHint(): string {
  return chalk.dim(`\nRun ${chalk.bold("zapi setup")} to configure interactively.`);
}

export function getInstanceId(): string {
  const id = process.env["ZAPI_INSTANCE_ID"];
  if (!id) {
    console.error(chalk.red("Error: ZAPI_INSTANCE_ID not set.") + missingConfigHint());
    process.exit(1);
  }
  return id;
}

export function getToken(): string {
  const token = process.env["ZAPI_TOKEN"];
  if (!token) {
    console.error(chalk.red("Error: ZAPI_TOKEN not set.") + missingConfigHint());
    process.exit(1);
  }
  return token;
}

export function getSecurityToken(): string | undefined {
  return process.env["ZAPI_SECURITY_TOKEN"] || undefined;
}

export function getBaseUrl(): string {
  const instanceId = getInstanceId();
  const token = getToken();
  return `https://api.z-api.io/instances/${instanceId}/token/${token}`;
}

export function loadConfig(): ZapiConfig {
  if (existsSync(CONFIG_FILE)) {
    try {
      return JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    } catch {
      // ignore
    }
  }
  return {
    instanceId: process.env["ZAPI_INSTANCE_ID"] || "",
    token: process.env["ZAPI_TOKEN"] || "",
    securityToken: process.env["ZAPI_SECURITY_TOKEN"] || "",
  };
}

export function saveConfig(cfg: ZapiConfig): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), "utf-8");
}

export function generateEnvFile(cfg: ZapiConfig): string {
  return [
    `ZAPI_INSTANCE_ID=${cfg.instanceId}`,
    `ZAPI_TOKEN=${cfg.token}`,
    `ZAPI_SECURITY_TOKEN=${cfg.securityToken}`,
    "",
  ].join("\n");
}
