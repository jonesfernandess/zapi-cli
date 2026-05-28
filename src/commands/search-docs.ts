import { Command } from "commander";
import { readFileSync, readdirSync, existsSync } from "fs";
import { resolve, dirname, join } from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";

type PostmanItem = {
  name: string;
  item?: PostmanItem[];
  request?: {
    method: string;
    description?: string;
    body?: { mode?: string; raw?: string };
    url?: {
      raw?: string;
      path?: string[];
    };
  };
};

type EndpointEntry = {
  method: string;
  path: string;
  name: string;
  folder: string;
  description?: string;
  bodyFields?: string[];
};

type GuideSection = {
  name: string;
  body: string;
};

function loadCollection(): PostmanItem {
  const dir = dirname(fileURLToPath(import.meta.url));
  const colPath = resolve(dir, "../../docs/z-api-collection.json");
  return JSON.parse(readFileSync(colPath, "utf-8")) as PostmanItem;
}

function loadAllSkills(): string {
  const dir = dirname(fileURLToPath(import.meta.url));
  const skillsRoot = resolve(dir, "../../skills");
  const parts: string[] = [];
  for (const entry of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const skillFile = join(skillsRoot, entry.name, "SKILL.md");
    if (existsSync(skillFile)) {
      parts.push(readFileSync(skillFile, "utf-8"));
    }
  }
  return parts.join("\n\n");
}

function extractEndpointPath(item: PostmanItem): string {
  const url = item.request?.url;
  if (!url) return "";
  if (url.path) {
    const parts = url.path.filter(
      (p) => p !== "{{BASE_URL}}" && p !== "{{INSTANCE_ID}}" && p !== "{{INSTANCE_TOKEN}}",
    );
    const pathStr = parts.join("/").replace(/\{\{[^}]+\}\}/g, "{param}");
    return "/" + pathStr;
  }
  if (url.raw) {
    const match = url.raw.match(/token\/[^/]+\/(.+)$/);
    return match ? "/" + match[1] : "";
  }
  return "";
}

function extractBodyFields(item: PostmanItem): string[] {
  const raw = item.request?.body?.raw;
  if (!raw) return [];
  try {
    const body = JSON.parse(raw) as Record<string, unknown>;
    return Object.keys(body);
  } catch {
    return [];
  }
}

function collectEndpoints(items: PostmanItem[], folder = ""): EndpointEntry[] {
  const endpoints: EndpointEntry[] = [];
  for (const item of items) {
    if (item.item) {
      const sub = (folder ? folder + "/" : "") + item.name;
      endpoints.push(...collectEndpoints(item.item, sub));
    } else if (item.request) {
      endpoints.push({
        method: item.request.method,
        path: extractEndpointPath(item),
        name: item.name,
        folder,
        description: item.request.description,
        bodyFields: extractBodyFields(item),
      });
    }
  }
  return endpoints;
}

function parseSkillSections(content: string): GuideSection[] {
  const sections: GuideSection[] = [];
  let current: GuideSection | null = null;
  for (const line of content.split("\n")) {
    if (line.startsWith("## ")) {
      if (current) sections.push(current);
      current = { name: line.slice(3).trim(), body: "" };
    } else if (current) {
      current.body += line + "\n";
    }
  }
  if (current) sections.push(current);
  return sections;
}

function matchesAll(text: string, words: string[]): boolean {
  const t = text.toLowerCase();
  return words.every((w) => t.includes(w));
}

function searchEndpoints(endpoints: EndpointEntry[], query: string): EndpointEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return endpoints.filter((e) => {
    const combined = [e.name, e.folder, e.path, e.description ?? "", (e.bodyFields ?? []).join(" ")]
      .join(" ")
      .toLowerCase();
    return matchesAll(combined, words);
  });
}

function searchGuide(sections: GuideSection[], query: string): GuideSection[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return sections.filter((s) => matchesAll((s.name + " " + s.body).toLowerCase(), words));
}

function guideExcerpt(section: GuideSection, query: string, maxLines = 6): string {
  const q = query.toLowerCase();
  const lines = section.body.split("\n");
  const hits: string[] = [];
  for (let i = 0; i < lines.length && hits.length < maxLines; i++) {
    if (lines[i].toLowerCase().includes(q)) {
      if (i > 0 && !hits.includes(lines[i - 1])) hits.push(lines[i - 1]);
      hits.push(lines[i]);
    }
  }
  return hits.length ? hits.join("\n") : lines.slice(0, maxLines).join("\n");
}

function methodColor(m: string) {
  if (m === "GET") return chalk.green;
  if (m === "DELETE") return chalk.red;
  if (m === "PUT") return chalk.yellow;
  return chalk.blue;
}

function printEndpoints(matches: EndpointEntry[], query: string): void {
  if (!matches.length) return;
  console.log(chalk.bold(`\n${matches.length} endpoint(s) para "${query}"\n`));
  for (const e of matches) {
    const color = methodColor(e.method);
    console.log(chalk.dim("─".repeat(64)));
    process.stdout.write(`${color.bold(`[${e.method}]`)} ${chalk.bold(e.path || e.name)}`);
    if (e.folder) process.stdout.write(chalk.dim(`  · ${e.folder}`));
    console.log();
    if (e.path && e.name !== e.path) console.log(`  ${e.name}`);
    if (e.description) {
      const lines = e.description.split("\n").filter((l) => l.trim());
      for (const line of lines.slice(0, 3)) console.log(chalk.dim(`  ${line.slice(0, 120)}`));
    }
    if (e.bodyFields?.length) {
      console.log(chalk.dim(`  body: ${e.bodyFields.join(", ")}`));
    }
    console.log();
  }
}

function printGuide(sections: GuideSection[], query: string): void {
  if (!sections.length) return;
  console.log(chalk.bold(`\n${sections.length} seção(ões) do guia para "${query}"\n`));
  for (const section of sections) {
    console.log(chalk.dim("─".repeat(64)));
    console.log(`${chalk.cyan.bold("[GUIA]")} ${chalk.bold(section.name)}`);
    const excerpt = guideExcerpt(section, query);
    for (const line of excerpt.split("\n")) {
      if (line.trim()) console.log(chalk.dim(`  ${line}`));
    }
    console.log();
  }
}

function collectFolders(endpoints: EndpointEntry[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const e of endpoints) {
    const top = e.folder.split("/")[0] || e.folder;
    counts.set(top, (counts.get(top) ?? 0) + 1);
  }
  return counts;
}

function printList(
  endpoints: EndpointEntry[],
  sections: GuideSection[],
  asJson: boolean,
): void {
  const folders = collectFolders(endpoints);
  const sectionNames = sections.map((s) => s.name);

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          api_categories: Array.from(folders.entries()).map(([cat, count]) => ({
            category: cat,
            endpoints: count,
          })),
          guide_sections: sectionNames,
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(chalk.bold("\nCategorias da API (use como query):\n"));
  for (const [cat, count] of folders.entries()) {
    console.log(`  ${chalk.cyan(cat)} ${chalk.dim(`(${count} endpoints)`)}`);
  }
  console.log(chalk.bold("\nSeções do guia (use com --section):\n"));
  for (const name of sectionNames) {
    console.log(`  ${chalk.yellow(name)}`);
  }
  console.log();
}

function printSection(sections: GuideSection[], name: string, asJson: boolean): void {
  const q = name.toLowerCase();
  const match = sections.find((s) => s.name.toLowerCase().includes(q));
  if (!match) {
    const names = sections.map((s) => `  • ${s.name}`).join("\n");
    console.error(chalk.red(`\nSeção "${name}" não encontrada.\n`));
    console.error(chalk.dim(`Seções disponíveis:\n${names}\n`));
    process.exit(1);
  }
  if (asJson) {
    console.log(JSON.stringify({ section: match.name, content: match.body.trim() }, null, 2));
    return;
  }
  console.log(chalk.bold(`\n## ${match.name}\n`));
  console.log(match.body.trim());
  console.log();
}

function toJson(
  endpoints: EndpointEntry[],
  guide: GuideSection[],
  query: string,
  pretty: boolean,
): void {
  const payload = {
    query,
    count: { endpoints: endpoints.length, guide: guide.length },
    endpoints: endpoints.map((e) => ({
      method: e.method,
      path: e.path,
      name: e.name,
      category: e.folder,
      description: e.description,
      bodyFields: e.bodyFields?.length ? e.bodyFields : undefined,
    })),
    guide: guide.map((s) => ({ section: s.name, content: s.body.trim() })),
  };
  console.log(JSON.stringify(payload, null, pretty ? 2 : 0));
}

export function registerSearchDocsCommand(program: Command): void {
  program
    .command("search-docs")
    .description("Busca endpoints e guias da Z-API por palavra-chave — útil para agentes e devs")
    .argument("[query]", "Termo de busca (obrigatório salvo com --list ou --section)")
    .option("--json", "Output JSON (machine-readable)")
    .option("--pretty", "Pretty-print JSON (implica --json)")
    .option("--list", "Lista categorias da API e seções do guia disponíveis")
    .option("--section <nome>", "Retorna seção completa do guia pelo nome")
    .action(
      (
        query: string | undefined,
        options: { json?: boolean; pretty?: boolean; list?: boolean; section?: string },
      ) => {
        try {
          const asJson = Boolean(options.json || options.pretty);
          const collection = loadCollection();
          const endpoints = collectEndpoints(collection.item ?? []);
          const skillContent = loadAllSkills();
          const skillSections = parseSkillSections(skillContent);

          if (options.list) {
            printList(endpoints, skillSections, asJson);
            return;
          }

          if (options.section) {
            printSection(skillSections, options.section, asJson);
            return;
          }

          if (!query) {
            console.error(
              chalk.red(
                '\nForneca uma query. Exemplo: zapi search-docs "send text"\n' +
                  "Ou use --list para ver tópicos disponíveis.\n",
              ),
            );
            process.exit(1);
          }

          const matchedEndpoints = searchEndpoints(endpoints, query);
          const matchedGuide = searchGuide(skillSections, query);
          const total = matchedEndpoints.length + matchedGuide.length;

          if (total === 0) {
            console.log(chalk.yellow(`\nNenhum resultado para: "${query}"\n`));
            console.log(
              chalk.dim(
                `  Dica: use ${chalk.white("zapi search-docs --list")} para ver tópicos disponíveis\n`,
              ),
            );
            return;
          }

          if (asJson) {
            toJson(matchedEndpoints, matchedGuide, query, Boolean(options.pretty));
          } else {
            printGuide(matchedGuide, query);
            printEndpoints(matchedEndpoints, query);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.error(chalk.red(`Erro: ${msg}`));
          process.exit(1);
        }
      },
    );
}
