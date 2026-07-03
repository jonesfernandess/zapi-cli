import { Command } from "commander";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import { homedir } from "os";
import chalk from "chalk";

export type Tool =
  | "cursor"
  | "copilot"
  | "windsurf"
  | "cline"
  | "claude"
  | "codex"
  | "gemini"
  | "opencode"
  | "hermes"
  | "openclaw";

export const TOOLS: Record<Tool, string> = {
  cursor: "Cursor",
  copilot: "GitHub Copilot",
  windsurf: "Windsurf",
  cline: "Cline",
  claude: "Claude Code",
  codex: "Codex CLI (OpenAI)",
  gemini: "Gemini CLI (Google)",
  opencode: "OpenCode",
  hermes: "Hermes (Nous Research)",
  openclaw: "OpenClaw",
};

export function skillsDir(): string {
  const dir = dirname(fileURLToPath(import.meta.url));
  return resolve(dir, "../../skills");
}

export function readSkill(name: string): string {
  const path = resolve(skillsDir(), name, "SKILL.md");
  return readFileSync(path, "utf-8");
}

function ensureDir(path: string): void {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

function write(path: string, content: string): void {
  writeFileSync(path, content, "utf-8");
  console.log(`  ${chalk.green("✓")} ${chalk.dim(path)}`);
}

function installSkillDir(skillsBase: string, apiRaw: string, cliRaw: string): void {
  ensureDir(join(skillsBase, "zapi-api"));
  ensureDir(join(skillsBase, "zapi-cli"));
  write(join(skillsBase, "zapi-api", "SKILL.md"), apiRaw);
  write(join(skillsBase, "zapi-cli", "SKILL.md"), cliRaw);
}

function installClaude(api: string, cli: string, isGlobal: boolean): void {
  const base = isGlobal ? join(homedir(), ".claude", "skills") : join(".claude", "skills");
  installSkillDir(base, api, cli);
}

function installCursor(api: string, cli: string, isGlobal: boolean): void {
  const base = isGlobal ? join(homedir(), ".cursor", "skills") : join(".cursor", "skills");
  installSkillDir(base, api, cli);
}

function installCopilot(api: string, cli: string, isGlobal: boolean): void {
  const base = isGlobal ? join(homedir(), ".copilot", "skills") : join(".github", "skills");
  installSkillDir(base, api, cli);
}

function installCline(api: string, cli: string, isGlobal: boolean): void {
  const base = isGlobal ? join(homedir(), ".cline", "skills") : join(".cline", "skills");
  installSkillDir(base, api, cli);
}

function installWindsurf(api: string, cli: string, isGlobal: boolean): void {
  const base = isGlobal
    ? join(homedir(), ".codeium", "windsurf", "skills")
    : join(".windsurf", "skills");
  installSkillDir(base, api, cli);
}

function installCodex(api: string, cli: string, isGlobal: boolean): void {
  const base = isGlobal ? join(homedir(), ".codex", "skills") : join(".agents", "skills");
  installSkillDir(base, api, cli);
}

function installOpenCode(api: string, cli: string, isGlobal: boolean): void {
  const base = isGlobal
    ? join(homedir(), ".config", "opencode", "skills")
    : join(".opencode", "skills");
  installSkillDir(base, api, cli);
}

function installGemini(api: string, cli: string, isGlobal: boolean): void {
  const base = isGlobal ? join(homedir(), ".gemini", "skills") : join(".gemini", "skills");
  installSkillDir(base, api, cli);
}

function installHermes(api: string, cli: string, isGlobal: boolean): void {
  const base = isGlobal ? join(homedir(), ".hermes", "skills") : join(".hermes", "skills");
  installSkillDir(base, api, cli);
}

function installOpenClaw(api: string, cli: string, isGlobal: boolean): void {
  const base = isGlobal ? join(homedir(), ".openclaw", "skills") : join(".agents", "skills");
  installSkillDir(base, api, cli);
}

export function isToolInstalled(tool: Tool, isGlobal = true): boolean {
  const paths: Record<Tool, [string, string]> = {
    claude: [join(homedir(), ".claude", "skills"), ".claude/skills"],
    cursor: [join(homedir(), ".cursor", "skills"), ".cursor/skills"],
    copilot: [join(homedir(), ".copilot", "skills"), ".github/skills"],
    cline: [join(homedir(), ".cline", "skills"), ".cline/skills"],
    windsurf: [join(homedir(), ".codeium", "windsurf", "skills"), ".windsurf/skills"],
    codex: [join(homedir(), ".codex", "skills"), ".agents/skills"],
    opencode: [join(homedir(), ".config", "opencode", "skills"), ".opencode/skills"],
    gemini: [join(homedir(), ".gemini", "skills"), ".gemini/skills"],
    hermes: [join(homedir(), ".hermes", "skills"), ".hermes/skills"],
    openclaw: [join(homedir(), ".openclaw", "skills"), ".agents/skills"],
  };
  const base = paths[tool][isGlobal ? 0 : 1];
  return existsSync(join(base, "zapi-api", "SKILL.md"));
}

export function installForTool(target: Tool, isGlobal = true): void {
  const apiRaw = readSkill("zapi-api");
  const cliRaw = readSkill("zapi-cli");
  switch (target) {
    case "claude":
      installClaude(apiRaw, cliRaw, isGlobal);
      break;
    case "cursor":
      installCursor(apiRaw, cliRaw, isGlobal);
      break;
    case "copilot":
      installCopilot(apiRaw, cliRaw, isGlobal);
      break;
    case "cline":
      installCline(apiRaw, cliRaw, isGlobal);
      break;
    case "windsurf":
      installWindsurf(apiRaw, cliRaw, isGlobal);
      break;
    case "codex":
      installCodex(apiRaw, cliRaw, isGlobal);
      break;
    case "opencode":
      installOpenCode(apiRaw, cliRaw, isGlobal);
      break;
    case "gemini":
      installGemini(apiRaw, cliRaw, isGlobal);
      break;
    case "hermes":
      installHermes(apiRaw, cliRaw, isGlobal);
      break;
    case "openclaw":
      installOpenClaw(apiRaw, cliRaw, isGlobal);
      break;
  }
}

export function registerInstallSkillsCommand(program: Command): void {
  program
    .command("install-skills")
    .description(
      "Install Z-API skills in your AI coding tool " +
        "(Claude Code, Cursor, Copilot, Windsurf, Cline, Codex CLI, Gemini CLI, OpenCode)",
    )
    .argument("[tool]", `Tool: ${Object.keys(TOOLS).join(" | ")} | all`)
    .option("--local", "Install in current project directory instead of home directory")
    .action((tool: string | undefined, opts: { local?: boolean }) => {
      const isGlobal = !opts.local;
      const validTools = [...Object.keys(TOOLS), "all"];

      if (!tool || !validTools.includes(tool)) {
        console.log(chalk.bold("\nUsage: zapi install-skills <tool> [--local]\n"));
        console.log("Available tools:\n");
        for (const [key, name] of Object.entries(TOOLS)) {
          console.log(`  ${chalk.cyan(key.padEnd(10))} ${name}`);
        }
        console.log(`  ${"all".padEnd(10)} Install for all tools`);
        console.log();
        console.log(chalk.dim("By default, skills are installed globally (~/ home directory)."));
        console.log(chalk.dim("Use --local to install in the current project directory instead."));
        console.log();
        process.exit(tool ? 1 : 0);
      }

      const targets: Tool[] =
        tool === "all" ? (Object.keys(TOOLS) as Tool[]) : [tool as Tool];
      const scopeLabel = isGlobal
        ? chalk.cyan("global (~/)")
        : chalk.yellow(`local (${process.cwd()})`);
      console.log(chalk.dim(`\nScope: ${scopeLabel}\n`));

      for (const target of targets) {
        console.log(chalk.bold(`Installing for ${TOOLS[target]}...\n`));
        try {
          installForTool(target, isGlobal);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(chalk.red(`  ✗ Failed: ${msg}`));
        }
        console.log();
      }

      console.log(chalk.green("Done.\n"));
    });
}
