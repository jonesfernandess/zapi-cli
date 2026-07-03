import chalk from "chalk";
import type { ApiResponse } from "./client.js";

const accent = chalk.hex("#98de62");

/**
 * Z-API returns HTTP 200 with { "value": false } to indicate failure
 * (e.g. disconnected instance, invalid phone, etc.).
 * Treat this as an error even when the HTTP status is ok.
 */
function isZapiFailure(data: unknown): boolean {
  if (data !== null && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (d["value"] === false) return true;
  }
  return false;
}

export function printResponse(resp: ApiResponse, title: string): void {
  if (!resp.ok || isZapiFailure(resp.data)) {
    if (!resp.ok) {
      console.error(chalk.red(`✗ HTTP ${resp.status}`));
    } else {
      console.error(chalk.red(`✗ ${title} failed`));
      console.error(chalk.dim("  Tip: run 'zapi instance status' to check if the instance is connected."));
    }
    console.error(formatJson(resp.data));
    process.exit(1);
  }
  console.log(accent(`✓ ${title}`));
  console.log(formatJson(resp.data));
}

export function formatJson(data: unknown): string {
  if (typeof data === "string") return data;
  return JSON.stringify(data, null, 2);
}

export function printError(msg: string): void {
  console.error(chalk.red(`✗ ${msg}`));
}

export function printSuccess(msg: string): void {
  console.log(accent(`✓ ${msg}`));
}

export function parseJsonArg(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    printError(`Invalid JSON: ${value}`);
    process.exit(1);
  }
}
