import { getBaseUrl, getSecurityToken } from "./config.js";
import chalk from "chalk";

export interface ApiResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export class ZapiClient {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = getBaseUrl();

    const securityToken = getSecurityToken();
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(securityToken ? { "Client-Token": securityToken } : {}),
    };
  }

  private url(path: string): string {
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${this.baseUrl}${cleanPath}`;
  }

  async get(path: string): Promise<ApiResponse> {
    return this.request("GET", path);
  }

  async post(path: string, body?: Record<string, unknown>): Promise<ApiResponse> {
    return this.request("POST", path, body);
  }

  async put(path: string, body?: Record<string, unknown>): Promise<ApiResponse> {
    return this.request("PUT", path, body);
  }

  async delete(path: string, body?: Record<string, unknown>): Promise<ApiResponse> {
    return this.request("DELETE", path, body);
  }

  private async request(
    method: string,
    path: string,
    body?: Record<string, unknown>,
  ): Promise<ApiResponse> {
    try {
      const resp = await fetch(this.url(path), {
        method,
        headers: this.headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      return this.handleResponse(resp);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(chalk.red(`✗ Network error: ${msg}`));
      console.error(chalk.dim("  Check your internet connection and the Z-API service status."));
      process.exit(1);
    }
  }

  private async handleResponse(resp: Response): Promise<ApiResponse> {
    let data: unknown;
    const text = await resp.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { ok: resp.ok, status: resp.status, data };
  }
}

/** Build a body object, excluding undefined/null values */
export function buildBody(obj: Record<string, unknown>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined && v !== null) body[k] = v;
  }
  return body;
}
