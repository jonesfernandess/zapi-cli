import chalk from "chalk";
import type { ApiResponse } from "./client.js";

const accent = chalk.hex("#98de62");

export function printResponse(resp: ApiResponse, title: string): void {
  if (!resp.ok) {
    console.error(chalk.red(`✗ HTTP ${resp.status}`));
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
