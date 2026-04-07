import * as p from "@clack/prompts";
import chalk from "chalk";
import figlet from "figlet";
import gradient from "gradient-string";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
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
  const banner = figlet.textSync("ZAPI", {
    font: "ANSI Shadow",
    horizontalLayout: "fitted",
  });
  console.log("");
  console.log(zapiGradient(banner));
  console.log(dim("  ─────────────────────────────────────────────────────"));
  console.log(
    `  ${accent("●")} ${chalk.bold.white("ZAPI CLI")}  ${dim("— Z-API WhatsApp from the terminal")}`,
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

  p.intro(chalk.bold("Vamos configurar a ZAPI CLI!"));

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
