import * as p from "@clack/prompts";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "fs";
import { join, extname } from "path";
import { homedir } from "os";

// ── Config ──

const CONFIG_DIR = join(homedir(), ".zapi-cli");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const ENV_FILE = join(CONFIG_DIR, ".env");

export interface ZapiConfig {
  instanceId: string;
  token: string;
  securityToken: string;
}

const DEFAULTS: ZapiConfig = {
  instanceId: "",
  token: "",
  securityToken: "",
};

export function loadConfig(): ZapiConfig {
  if (!existsSync(CONFIG_FILE)) return { ...DEFAULTS };
  try {
    const data = JSON.parse(readFileSync(CONFIG_FILE, "utf-8"));
    return { ...DEFAULTS, ...data };
  } catch {
    return { ...DEFAULTS };
  }
}

function saveConfig(config: ZapiConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  generateEnvFile(config);
}

function generateEnvFile(config: ZapiConfig): void {
  const lines = [
    `ZAPI_INSTANCE_ID=${config.instanceId}`,
    `ZAPI_TOKEN=${config.token}`,
  ];
  if (config.securityToken) lines.push(`ZAPI_SECURITY_TOKEN=${config.securityToken}`);
  writeFileSync(ENV_FILE, lines.join("\n") + "\n");
}

function getBaseUrl(config: ZapiConfig): string {
  return `https://api.z-api.io/instances/${config.instanceId}/token/${config.token}`;
}

// ── Styling ──

const accent = chalk.hex("#98de62"); // Z-API green
const dim = chalk.dim;
const zapiGradient = gradient(["#78c43f", "#98de62", "#b8f484"]);

function showBanner(): void {
  const banner = figlet.textSync("Z-API", {
    font: "ANSI Shadow",
    horizontalLayout: "fitted",
  });
  console.log("");
  console.log(zapiGradient(banner));
  console.log(dim("  ─────────────────────────────────────────────────────"));
  console.log(
    `  ${accent("●")} ${chalk.bold.white("Z-API CLI")}  ${dim("— Z-API WhatsApp from the terminal")}`,
  );
  console.log(dim("  ─────────────────────────────────────────────────────"));
}

function maskToken(value: string): string {
  if (!value) return chalk.red("nao configurado");
  if (value.length <= 10) return chalk.green("****");
  return chalk.green(value.slice(0, 6) + "..." + value.slice(-4));
}

function statusBar(config: ZapiConfig): void {
  const lines = [
    "",
    `  ${dim("Instance ID".padEnd(18))} ${config.instanceId ? maskToken(config.instanceId) : chalk.red("nao configurado")}`,
    `  ${dim("Token".padEnd(18))} ${maskToken(config.token)}`,
    `  ${dim("Security Token".padEnd(18))} ${maskToken(config.securityToken)}`,
    `  ${dim("Config".padEnd(18))} ${chalk.hex("#98de62")(CONFIG_FILE)}`,
    "",
  ];
  console.log(lines.join("\n"));
}

// ── Setup Wizard ──

async function runSetupWizard(config: ZapiConfig): Promise<void> {
  console.clear();
  showBanner();

  p.intro(chalk.bold("Vamos configurar a Z-API CLI!"));

  // Step 1: Instance ID
  console.log("");
  p.log.step(accent("Passo 1/3") + dim(" — Instance ID"));
  p.log.message(dim("O identificador da sua instancia Z-API."));
  p.log.message(dim("Encontre no painel da Z-API em 'Suas instancias'."));

  const instanceId = await p.text({
    message: "Instance ID da Z-API",
    placeholder: "Ex: 3C2A7F9B1E4D8...",
    initialValue: config.instanceId || "",
    validate: (v) => {
      if (!v || !v.trim()) return "Instance ID e obrigatorio";
      return undefined;
    },
  });
  if (p.isCancel(instanceId)) {
    p.outro(dim("Setup cancelado."));
    process.exit(0);
  }
  config.instanceId = (instanceId as string).trim();
  saveConfig(config);
  p.log.success("Instance ID salvo!");

  // Step 2: Token
  console.log("");
  p.log.step(accent("Passo 2/3") + dim(" — Token da Instancia"));
  p.log.message(dim("O token da sua instancia WhatsApp na Z-API."));
  p.log.message(dim("Encontre no painel da Z-API ao lado do Instance ID."));

  const token = await p.text({
    message: "Token da instancia",
    placeholder: "Cole o token aqui",
    initialValue: config.token || "",
    validate: (v) => {
      if (!v || !v.trim()) return "Token e obrigatorio";
      return undefined;
    },
  });
  if (p.isCancel(token)) {
    p.outro(dim("Setup cancelado."));
    process.exit(0);
  }
  config.token = (token as string).trim();
  saveConfig(config);
  p.log.success("Token salvo!");

  // Step 3: Security Token (optional)
  console.log("");
  p.log.step(accent("Passo 3/3") + dim(" — Security Token (opcional)"));
  p.log.message(dim("Token de seguranca do cliente para validacao de webhooks."));
  p.log.message(dim("Encontre em 'Seguranca' no painel da Z-API."));

  const wantSecurity = await p.confirm({
    message: "Deseja configurar o security token?",
    initialValue: false,
  });

  if (!p.isCancel(wantSecurity) && wantSecurity) {
    const securityToken = await p.text({
      message: "Security token",
      placeholder: "Cole o security token aqui",
      initialValue: config.securityToken || "",
    });
    if (!p.isCancel(securityToken)) {
      config.securityToken = (securityToken as string).trim();
      saveConfig(config);
      p.log.success("Security token salvo!");
    }
  }

  // Done
  console.log("");
  console.log(dim("  ─────────────────────────────────────────────────────"));
  p.log.success(chalk.bold("Tudo pronto!"));
  p.log.message(dim("Config salva em " + CONFIG_FILE));
  p.log.message(dim("Env salvo em " + ENV_FILE));
  console.log(dim("  ─────────────────────────────────────────────────────"));
  console.log("");
  p.log.message("Agora voce pode usar:");
  p.log.message(accent("  zapi status"));
  p.log.message(accent('  zapi send text --phone 5511999 --message "Ola"'));
  p.log.message(accent("  zapi instances"));
  console.log("");

  const goMenu = await p.confirm({
    message: "Abrir menu interativo?",
    initialValue: true,
  });
  if (!p.isCancel(goMenu) && goMenu) {
    return mainMenu();
  }
  p.outro(dim("Ate mais!"));
}

// ── Menu Handlers ──

async function handleInstanceId(config: ZapiConfig): Promise<void> {
  const instanceId = await p.text({
    message: "Instance ID da Z-API",
    placeholder: "Ex: 3C2A7F9B1E4D8...",
    initialValue: config.instanceId || "",
    validate: (v) => {
      if (!v?.trim()) return "Instance ID obrigatorio";
      return undefined;
    },
  });
  if (p.isCancel(instanceId)) return mainMenu();
  config.instanceId = (instanceId as string).trim();
  saveConfig(config);
  p.log.success("Instance ID atualizado!");
  return mainMenu();
}

async function handleToken(config: ZapiConfig): Promise<void> {
  const token = await p.text({
    message: "Token da instancia",
    placeholder: "Cole o token",
    initialValue: config.token || "",
    validate: (v) => {
      if (!v?.trim()) return "Token obrigatorio";
      return undefined;
    },
  });
  if (p.isCancel(token)) return mainMenu();
  config.token = (token as string).trim();
  saveConfig(config);
  p.log.success("Token atualizado!");
  return mainMenu();
}

async function handleSecurityToken(config: ZapiConfig): Promise<void> {
  const securityToken = await p.text({
    message: "Security token",
    placeholder: "Cole o security token (vazio para remover)",
    initialValue: config.securityToken || "",
  });
  if (p.isCancel(securityToken)) return mainMenu();
  config.securityToken = (securityToken as string).trim();
  saveConfig(config);
  p.log.success(config.securityToken ? "Security token atualizado!" : "Security token removido!");
  return mainMenu();
}

async function handleTestConnection(config: ZapiConfig): Promise<void> {
  if (!config.instanceId || !config.token) {
    p.log.error("Configure o Instance ID e o token primeiro.");
    return mainMenu();
  }

  const s = p.spinner();
  s.start("Testando conexao...");

  try {
    const baseUrl = getBaseUrl(config);
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (config.securityToken) {
      headers["Client-Token"] = config.securityToken;
    }

    const resp = await fetch(`${baseUrl}/status`, {
      headers,
    });
    const data = await resp.json() as Record<string, unknown>;

    if (resp.ok) {
      const connected = data["connected"] === true;
      const smartphoneConnected = data["smartphoneConnected"] === true;
      const session = (data["session"] as string) || "";
      const phone = (data["phone"] as string) || (data["number"] as string) || "";

      if (connected) {
        s.stop(chalk.green("Conectado!"));
      } else {
        s.stop(chalk.yellow("Desconectado"));
      }

      p.log.success(`Status: ${connected ? accent("connected") : chalk.yellow("disconnected")}`);
      if (smartphoneConnected) {
        p.log.message(`Smartphone: ${chalk.green("conectado")}`);
      } else {
        p.log.message(`Smartphone: ${chalk.yellow("desconectado")}`);
      }
      if (session) p.log.message(`Sessao: ${chalk.white(session)}`);
      if (phone) p.log.message(`Numero: ${chalk.white(phone)}`);

      // Show webhook status if available
      const webhookStatus = data["webhookStatus"] as Record<string, unknown> | undefined;
      if (webhookStatus) {
        const webhookUrl = (webhookStatus["url"] as string) || "";
        if (webhookUrl) {
          p.log.message(`Webhook: ${chalk.white(webhookUrl)}`);
        }
      }
    } else {
      s.stop(chalk.red("Erro na conexao"));
      p.log.error(`HTTP ${resp.status}: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    s.stop(chalk.red("Falha na conexao"));
    p.log.error(String(err));
  }

  return mainMenu();
}

async function handleListInstances(config: ZapiConfig): Promise<void> {
  if (!config.securityToken) {
    p.log.warn("Para listar instancias, voce precisa de acesso de parceiro Z-API.");
    p.log.message(dim("Configure o Security Token com permissoes de parceiro."));
    p.log.message(dim("Consulte: https://developer.z-api.io/partner"));
    return mainMenu();
  }

  const s = p.spinner();
  s.start("Buscando instancias...");

  try {
    const resp = await fetch("https://api.z-api.io/instances/list", {
      headers: {
        Accept: "application/json",
        "Client-Token": config.securityToken,
      },
    });
    const data = await resp.json();

    if (!resp.ok) {
      s.stop(chalk.red("Erro ao listar"));
      p.log.error(`HTTP ${resp.status}: ${JSON.stringify(data)}`);
      p.log.message(dim("Verifique se o Security Token tem permissoes de parceiro."));
      return mainMenu();
    }

    const instances = Array.isArray(data) ? data : (data as Record<string, unknown>)["instances"] as unknown[] || [data];
    s.stop(chalk.green(`${instances.length} instancia(s) encontrada(s)`));

    console.log("");
    for (const inst of instances) {
      const i = inst as Record<string, unknown>;
      const connected = i["connected"] === true;
      const statusIcon = connected ? chalk.green("●") : chalk.red("●");
      const statusText = connected ? chalk.green("connected") : chalk.red("disconnected");

      const name = (i["name"] as string) || (i["profileName"] as string) || "—";
      const id = (i["id"] as string) || (i["instanceId"] as string) || "";
      const phone = (i["phone"] as string) || (i["number"] as string) || "";
      const tokenStr = (i["token"] as string) || "";
      const tokenDisplay = tokenStr ? tokenStr.slice(0, 8) + "..." + tokenStr.slice(-4) : "—";

      console.log(`  ${statusIcon} ${chalk.bold.white(name)} ${dim(`(${id})`)}`);
      console.log(`    ${dim("Status:")} ${statusText}  ${dim("Numero:")} ${phone || "—"}  ${dim("Token:")} ${accent(tokenDisplay)}`);
      console.log("");
    }
  } catch (err) {
    s.stop(chalk.red("Falha na requisicao"));
    p.log.error(String(err));
  }

  return mainMenu();
}

async function handleQuickSend(config: ZapiConfig): Promise<void> {
  if (!config.instanceId || !config.token) {
    p.log.error("Configure o Instance ID e o token primeiro.");
    return mainMenu();
  }

  const phone = await p.text({
    message: "Numero do destinatario (com DDI)",
    placeholder: "5511999999999",
    validate: (v) => {
      if (!v?.trim()) return "Numero obrigatorio";
      if (!/^\d{10,15}$/.test(v.trim())) return "Numero invalido (apenas digitos, 10-15 chars)";
      return undefined;
    },
  });
  if (p.isCancel(phone)) return mainMenu();

  const message = await p.text({
    message: "Mensagem",
    placeholder: "Escreva sua mensagem...",
    validate: (v) => {
      if (!v?.trim()) return "Mensagem obrigatoria";
      return undefined;
    },
  });
  if (p.isCancel(message)) return mainMenu();

  const s = p.spinner();
  s.start("Enviando mensagem...");

  try {
    const baseUrl = getBaseUrl(config);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (config.securityToken) {
      headers["Client-Token"] = config.securityToken;
    }

    const resp = await fetch(`${baseUrl}/send-text`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        phone: (phone as string).trim(),
        message: (message as string).trim(),
      }),
    });

    if (resp.ok) {
      s.stop(chalk.green("Mensagem enviada!"));
    } else {
      const data = await resp.json();
      s.stop(chalk.red("Erro ao enviar"));
      p.log.error(JSON.stringify(data));
    }
  } catch (err) {
    s.stop(chalk.red("Falha no envio"));
    p.log.error(String(err));
  }

  return mainMenu();
}

// ── Bulk Send ──

function parseNumbersFromText(raw: string): string[] {
  return raw
    .split(/[\n,;]+/)
    .map((n) => n.trim().replace(/\D/g, ""))
    .filter((n) => n.length >= 10 && n.length <= 15);
}

function parseNumbersFromCsv(content: string): string[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const numbers: string[] = [];
  for (const line of lines) {
    const cols = line.split(/[,;\t]+/);
    for (const col of cols) {
      const clean = col.trim().replace(/^["']|["']$/g, "").replace(/\D/g, "");
      if (clean.length >= 10 && clean.length <= 15) {
        numbers.push(clean);
      }
    }
  }
  return numbers;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleBulkSend(config: ZapiConfig): Promise<void> {
  if (!config.instanceId || !config.token) {
    p.log.error("Configure o Instance ID e o token primeiro.");
    return mainMenu();
  }

  const action = await p.select({
    message: "Envio em massa",
    options: [
      { value: "new", label: `${chalk.green("+")} Nova campanha`, hint: "criar envio em massa" },
      { value: "queue", label: `${chalk.cyan("☰")} Ver fila`, hint: "ver fila de mensagens" },
      { value: "clear-queue", label: `${chalk.yellow("✓")} Limpar fila`, hint: "remover fila de mensagens" },
      { value: "back", label: `${chalk.red("←")} Voltar` },
    ],
  });

  if (p.isCancel(action) || action === "back") return mainMenu();

  if (action === "queue") {
    const s = p.spinner();
    s.start("Buscando fila...");
    try {
      const baseUrl = getBaseUrl(config);
      const headers: Record<string, string> = { Accept: "application/json" };
      if (config.securityToken) headers["Client-Token"] = config.securityToken;

      const resp = await fetch(`${baseUrl}/queue`, { headers });
      const data = await resp.json();
      if (resp.ok) {
        s.stop(chalk.green("Fila carregada"));
        const items = Array.isArray(data) ? data : [];
        if (items.length === 0) {
          p.log.info("Fila vazia.");
        } else {
          p.log.info(`${accent(String(items.length))} mensagem(ns) na fila`);
          for (const item of items.slice(0, 20)) {
            const i = item as Record<string, unknown>;
            const phone = (i["phone"] as string) || "";
            const msg = (i["message"] as string) || "";
            const id = (i["messageId"] as string) || (i["id"] as string) || "";
            console.log(`  ${dim("●")} ${chalk.white(phone)} ${dim(msg.slice(0, 40))} ${dim(id ? `(${id})` : "")}`);
          }
          if (items.length > 20) {
            console.log(dim(`  ... e mais ${items.length - 20}`));
          }
        }
      } else {
        s.stop(chalk.red("Erro"));
        p.log.error(JSON.stringify(data));
      }
    } catch (err) {
      s.stop(chalk.red("Falha"));
      p.log.error(String(err));
    }
    return handleBulkSend(config);
  }

  if (action === "clear-queue") {
    const confirm = await p.confirm({
      message: "Tem certeza que deseja limpar a fila?",
      initialValue: false,
    });
    if (p.isCancel(confirm) || !confirm) return handleBulkSend(config);

    const s = p.spinner();
    s.start("Limpando fila...");
    try {
      const baseUrl = getBaseUrl(config);
      const headers: Record<string, string> = { Accept: "application/json" };
      if (config.securityToken) headers["Client-Token"] = config.securityToken;

      const resp = await fetch(`${baseUrl}/queue`, { method: "DELETE", headers });
      const data = await resp.json();
      if (resp.ok) {
        s.stop(chalk.green("Fila limpa!"));
      } else {
        s.stop(chalk.red("Erro"));
        p.log.error(JSON.stringify(data));
      }
    } catch (err) {
      s.stop(chalk.red("Falha"));
      p.log.error(String(err));
    }
    return handleBulkSend(config);
  }

  // ── Nova campanha ──

  const inputMethod = await p.select({
    message: "Como deseja informar os numeros?",
    options: [
      { value: "type", label: "Digitar numeros", hint: "separados por virgula ou um por linha" },
      { value: "file", label: "Importar de arquivo", hint: "CSV ou TXT" },
    ],
  });
  if (p.isCancel(inputMethod)) return handleBulkSend(config);

  let numbers: string[] = [];

  if (inputMethod === "file") {
    const searchDirs = [homedir(), join(homedir(), "Desktop"), join(homedir(), "Downloads"), process.cwd()];
    const files: Array<{ value: string; label: string }> = [];

    for (const dir of searchDirs) {
      try {
        if (!existsSync(dir)) continue;
        const entries = readdirSync(dir);
        for (const entry of entries) {
          const ext = extname(entry).toLowerCase();
          if ([".csv", ".txt"].includes(ext)) {
            const full = join(dir, entry);
            const label = `${entry} ${dim(`(${dir})`)}`;
            if (!files.some((f) => f.value === full)) {
              files.push({ value: full, label });
            }
          }
        }
      } catch { /* skip inaccessible dirs */ }
    }

    if (files.length === 0) {
      p.log.warn("Nenhum arquivo .csv ou .txt encontrado em ~/Desktop, ~/Downloads ou diretorio atual.");
      const filePath = await p.text({
        message: "Caminho completo do arquivo",
        placeholder: "/caminho/para/numeros.csv",
        validate: (v) => {
          if (!v?.trim()) return "Caminho obrigatorio";
          if (!existsSync(v.trim())) return "Arquivo nao encontrado";
          return undefined;
        },
      });
      if (p.isCancel(filePath)) return handleBulkSend(config);
      const content = readFileSync((filePath as string).trim(), "utf-8");
      numbers = parseNumbersFromCsv(content);
    } else {
      files.push({ value: "__custom__", label: "Digitar caminho manualmente..." });
      const chosen = await p.select({
        message: "Selecione o arquivo",
        options: files,
      });
      if (p.isCancel(chosen)) return handleBulkSend(config);

      let filePath = chosen as string;
      if (filePath === "__custom__") {
        const custom = await p.text({
          message: "Caminho completo do arquivo",
          placeholder: "/caminho/para/numeros.csv",
          validate: (v) => {
            if (!v?.trim()) return "Caminho obrigatorio";
            if (!existsSync(v.trim())) return "Arquivo nao encontrado";
            return undefined;
          },
        });
        if (p.isCancel(custom)) return handleBulkSend(config);
        filePath = (custom as string).trim();
      }

      const content = readFileSync(filePath, "utf-8");
      numbers = parseNumbersFromCsv(content);
    }
  } else {
    const raw = await p.text({
      message: "Numeros (separados por virgula, ponto-e-virgula ou um por linha)",
      placeholder: "5511999999999, 5511888888888",
      validate: (v) => {
        if (!v?.trim()) return "Informe pelo menos um numero";
        const parsed = parseNumbersFromText(v);
        if (parsed.length === 0) return "Nenhum numero valido encontrado (10-15 digitos)";
        return undefined;
      },
    });
    if (p.isCancel(raw)) return handleBulkSend(config);
    numbers = parseNumbersFromText(raw as string);
  }

  // Deduplicate
  numbers = [...new Set(numbers)];

  if (numbers.length === 0) {
    p.log.error("Nenhum numero valido encontrado.");
    return handleBulkSend(config);
  }

  p.log.info(`${accent(String(numbers.length))} numero(s) valido(s) encontrado(s)`);
  if (numbers.length <= 10) {
    p.log.message(dim(numbers.join(", ")));
  } else {
    p.log.message(dim(`${numbers.slice(0, 5).join(", ")} ... e mais ${numbers.length - 5}`));
  }

  const text = await p.text({
    message: "Mensagem para enviar",
    placeholder: "Escreva a mensagem que sera enviada para todos...",
    validate: (v) => {
      if (!v?.trim()) return "Mensagem obrigatoria";
      return undefined;
    },
  });
  if (p.isCancel(text)) return handleBulkSend(config);

  const delayChoice = await p.select({
    message: "Delay entre mensagens",
    options: [
      { value: 0, label: "Sem delay", hint: "envia o mais rapido possivel" },
      { value: 1000, label: "1 segundo" },
      { value: 3000, label: "3 segundos" },
      { value: 5000, label: "5 segundos" },
      { value: 10000, label: "10 segundos" },
      { value: -1, label: "Personalizado", hint: "definir em milissegundos" },
    ],
  });
  if (p.isCancel(delayChoice)) return handleBulkSend(config);

  let delay = delayChoice as number;
  if (delay === -1) {
    const customDelay = await p.text({
      message: "Delay em milissegundos",
      placeholder: "2000",
      validate: (v) => {
        if (!v?.trim()) return "Valor obrigatorio";
        const n = parseInt(v.trim(), 10);
        if (isNaN(n) || n < 0) return "Deve ser um numero >= 0";
        return undefined;
      },
    });
    if (p.isCancel(customDelay)) return handleBulkSend(config);
    delay = parseInt((customDelay as string).trim(), 10);
  }

  // Confirmation
  const delayLabel = delay === 0 ? "nenhum" : `${delay}ms (${(delay / 1000).toFixed(1)}s)`;
  console.log("");
  console.log(dim("  ─────────────────────────────────────────────────────"));
  console.log(`  ${chalk.bold.white("Resumo do envio em massa")}`);
  console.log(`  ${dim("Destinatarios:")} ${accent(String(numbers.length))}`);
  console.log(`  ${dim("Mensagem:")} ${chalk.white((text as string).slice(0, 80))}${(text as string).length > 80 ? "..." : ""}`);
  console.log(`  ${dim("Delay:")} ${chalk.white(delayLabel)}`);
  if (delay > 0 && numbers.length > 1) {
    const totalSec = ((numbers.length - 1) * delay) / 1000;
    const totalMin = totalSec / 60;
    const estimate = totalMin >= 1 ? `~${totalMin.toFixed(1)} min` : `~${totalSec.toFixed(0)}s`;
    console.log(`  ${dim("Tempo estimado:")} ${chalk.white(estimate)}`);
  }
  console.log(dim("  ─────────────────────────────────────────────────────"));
  console.log("");

  const confirmSend = await p.confirm({
    message: `Enviar para ${numbers.length} numero(s)?`,
    initialValue: false,
  });
  if (p.isCancel(confirmSend) || !confirmSend) {
    p.log.info("Envio cancelado.");
    return handleBulkSend(config);
  }

  // Send messages one by one
  const baseUrl = getBaseUrl(config);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (config.securityToken) headers["Client-Token"] = config.securityToken;

  let sent = 0;
  let failed = 0;
  const failures: Array<{ phone: string; error: string }> = [];
  const messageText = (text as string).trim();

  console.log("");
  for (let i = 0; i < numbers.length; i++) {
    const phone = numbers[i];
    const progress = `[${i + 1}/${numbers.length}]`;

    try {
      const resp = await fetch(`${baseUrl}/send-text`, {
        method: "POST",
        headers,
        body: JSON.stringify({ phone, message: messageText }),
      });

      if (resp.ok) {
        sent++;
        process.stdout.write(`\r  ${chalk.green("✓")} ${progress} ${dim(phone)} `);
      } else {
        const data = await resp.json() as Record<string, unknown>;
        failed++;
        failures.push({ phone, error: `HTTP ${resp.status}` });
        process.stdout.write(`\r  ${chalk.red("✗")} ${progress} ${dim(phone)} ${chalk.red(`HTTP ${resp.status}`)} `);
      }
    } catch (err) {
      failed++;
      failures.push({ phone, error: String(err) });
      process.stdout.write(`\r  ${chalk.red("✗")} ${progress} ${dim(phone)} ${chalk.red("erro")} `);
    }

    // Delay between messages (except after the last one)
    if (delay > 0 && i < numbers.length - 1) {
      await sleep(delay);
    }
  }

  console.log("\n");
  console.log(dim("  ─────────────────────────────────────────────────────"));
  console.log(`  ${chalk.bold.white("Resultado do envio em massa")}`);
  console.log(`  ${chalk.green("✓")} Enviados: ${accent(String(sent))}`);
  if (failed > 0) {
    console.log(`  ${chalk.red("✗")} Falharam: ${chalk.red(String(failed))}`);
    for (const f of failures.slice(0, 10)) {
      console.log(`    ${dim("●")} ${f.phone} — ${chalk.red(f.error)}`);
    }
    if (failures.length > 10) {
      console.log(dim(`    ... e mais ${failures.length - 10} falha(s)`));
    }
  }
  console.log(dim("  ─────────────────────────────────────────────────────"));
  console.log("");

  return handleBulkSend(config);
}

// ── Main Menu ──

async function mainMenu(): Promise<void> {
  const config = loadConfig();

  console.clear();
  showBanner();
  statusBar(config);

  const isConfigured = Boolean(config.instanceId && config.token);

  const options: Array<{ value: string; label: string; hint?: string }> = [];

  if (isConfigured) {
    options.push(
      { value: "test", label: `${chalk.green("⚡")} Testar conexao`, hint: "verifica status da instancia" },
      { value: "instances", label: `${chalk.cyan("☰")} Listar instancias`, hint: "requer acesso de parceiro" },
      { value: "send", label: `${chalk.green("✉")} Enviar mensagem`, hint: "envio rapido de texto" },
      { value: "bulk-send", label: `${chalk.magenta("◆")} Envio em massa`, hint: "campanhas e sender" },
    );
  }

  options.push(
    { value: "setup", label: `${accent("⚙")} Setup wizard`, hint: isConfigured ? "reconfigurar" : "configurar agora" },
    { value: "instance-id", label: "Instance ID" },
    { value: "token", label: "Token" },
    { value: "security-token", label: "Security Token" },
    { value: "exit", label: `${chalk.red("✕")} Sair` },
  );

  const action = await p.select({
    message: "O que deseja fazer?",
    options,
  });

  if (p.isCancel(action) || action === "exit") {
    p.outro(dim("Ate mais!"));
    process.exit(0);
  }

  switch (action) {
    case "test":
      return handleTestConnection(config);
    case "instances":
      return handleListInstances(config);
    case "send":
      return handleQuickSend(config);
    case "bulk-send":
      return handleBulkSend(config);
    case "setup":
      return runSetupWizard(config);
    case "instance-id":
      return handleInstanceId(config);
    case "token":
      return handleToken(config);
    case "security-token":
      return handleSecurityToken(config);
  }
}

// ── Exports ──

export async function startInteractive(): Promise<void> {
  const config = loadConfig();
  if (!config.instanceId || !config.token) {
    return runSetupWizard(config);
  }
  return mainMenu();
}

export { runSetupWizard, mainMenu, CONFIG_DIR, ENV_FILE };
