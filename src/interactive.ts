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
  partnerToken: string;
}

const DEFAULTS: ZapiConfig = {
  instanceId: "",
  token: "",
  securityToken: "",
  partnerToken: "",
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
  if (config.partnerToken)  lines.push(`ZAPI_PARTNER_TOKEN=${config.partnerToken}`);
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

  // Step 3: Security Token (Client-Token)
  console.log("");
  p.log.step(accent("Passo 3/4") + dim(" — Security Token (Client-Token)"));
  p.log.message(dim("Exigido pela maioria das instancias. Encontre em 'Seguranca' no painel Z-API."));
  p.log.message(dim("Sem ele voce recebera: HTTP 400 'your client-token is not configured'."));

  const wantSecurity = await p.confirm({
    message: "Deseja configurar o security token?",
    initialValue: Boolean(config.securityToken),
  });

  if (!p.isCancel(wantSecurity) && wantSecurity) {
    const securityToken = await p.text({
      message: "Security token (Client-Token)",
      placeholder: "Cole o security token aqui",
      initialValue: config.securityToken || "",
    });
    if (!p.isCancel(securityToken)) {
      config.securityToken = (securityToken as string).trim();
      saveConfig(config);
      p.log.success("Security token salvo!");
    }
  }

  // Step 4: Partner Token (optional)
  console.log("");
  p.log.step(accent("Passo 4/4") + dim(" — Partner Token (opcional)"));
  p.log.message(dim("Necessario apenas para contas parceiras (listar/criar instancias)."));
  p.log.message(dim("Encontre no painel Z-API em 'Parceiros' > 'Token de autorizacao'."));

  const wantPartner = await p.confirm({
    message: "Deseja configurar o partner token?",
    initialValue: Boolean(config.partnerToken),
  });

  if (!p.isCancel(wantPartner) && wantPartner) {
    const partnerToken = await p.text({
      message: "Partner token (Authorization Bearer)",
      placeholder: "Cole o partner token aqui",
      initialValue: config.partnerToken || "",
    });
    if (!p.isCancel(partnerToken)) {
      config.partnerToken = (partnerToken as string).trim();
      saveConfig(config);
      p.log.success("Partner token salvo!");
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

// ── Helpers ──

async function continuePrompt(): Promise<void> {
  await p.select({
    message: chalk.dim("Pressione Enter para voltar ao menu"),
    options: [{ value: "ok", label: "↩  Voltar" }],
  });
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
    message: "Security token (Client-Token da instancia)",
    placeholder: "Cole o security token (vazio para remover)",
    initialValue: config.securityToken || "",
  });
  if (p.isCancel(securityToken)) return mainMenu();
  config.securityToken = (securityToken as string).trim();
  saveConfig(config);
  p.log.success(config.securityToken ? "Security token atualizado!" : "Security token removido!");
  return mainMenu();
}

async function handlePartnerToken(config: ZapiConfig): Promise<void> {
  p.log.message(dim("  Token de autorizacao para a API de parceiros Z-API (Bearer)."));
  p.log.message(dim("  Encontre em: painel Z-API > Parceiros > Token de autorizacao."));
  p.log.message(dim("  Diferente do Security Token da instancia."));
  const partnerToken = await p.text({
    message: "Partner token (Authorization Bearer)",
    placeholder: "Cole o partner token (vazio para remover)",
    initialValue: config.partnerToken || "",
  });
  if (p.isCancel(partnerToken)) return mainMenu();
  config.partnerToken = (partnerToken as string).trim();
  saveConfig(config);
  p.log.success(config.partnerToken ? "Partner token atualizado!" : "Partner token removido!");
  return mainMenu();
}

async function handleTestConnection(config: ZapiConfig): Promise<void> {
  if (!config.instanceId || !config.token) {
    p.log.error("Configure o Instance ID e o token primeiro.");
    await continuePrompt();
    return mainMenu();
  }

  const s = p.spinner();
  s.start("Testando conexao...");

  try {
    const baseUrl = getBaseUrl(config);
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (config.securityToken) {
      headers["Client-Token"] = config.securityToken;
    }

    const resp = await fetch(`${baseUrl}/status`, { headers });
    const text = await resp.text();
    let data: Record<string, unknown> = {};
    try { data = JSON.parse(text) as Record<string, unknown>; } catch { /* not JSON */ }

    if (resp.ok) {
      const connected = data["connected"] === true;
      const smartphoneConnected = data["smartphoneConnected"] === true;
      const session = (data["session"] as string) || "";
      const phone = (data["phone"] as string) || (data["number"] as string) || "";

      s.stop(connected ? chalk.green("Conectado!") : chalk.yellow("Desconectado"));

      if (connected) {
        p.log.success(`Status: ${accent("connected")}`);
      } else {
        p.log.warn("Status: desconectado — escaneie o QR code para conectar");
        p.log.message(dim("  Use: zapi instance qr-code"));
      }

      if (smartphoneConnected) {
        p.log.message(`Smartphone: ${chalk.green("conectado")}`);
      } else {
        p.log.message(`Smartphone: ${chalk.yellow("desconectado")}`);
      }
      if (session) p.log.message(`Sessao:  ${chalk.white(session)}`);
      if (phone)   p.log.message(`Numero:  ${chalk.white(phone)}`);

      const webhookStatus = data["webhookStatus"] as Record<string, unknown> | undefined;
      if (webhookStatus) {
        const webhookUrl = (webhookStatus["url"] as string) || "";
        if (webhookUrl) p.log.message(`Webhook: ${chalk.white(webhookUrl)}`);
      }

      if (!connected) {
        p.log.message("");
        p.log.warn(chalk.bold("Instancia desconectada = mensagens nao serao enviadas"));
      }
    } else {
      s.stop(chalk.red("Erro na conexao"));
      p.log.error(`HTTP ${resp.status}`);
      p.log.error(text.slice(0, 300));
      if (resp.status === 401 || resp.status === 403) {
        p.log.message(dim("  Verifique se o Instance ID e o Token estao corretos."));
      }
    }
  } catch (err) {
    s.stop(chalk.red("Falha na conexao"));
    p.log.error(String(err));
    p.log.message(dim("  Verifique sua conexao com a internet."));
  }

  await continuePrompt();
  return mainMenu();
}

async function handleListInstances(config: ZapiConfig): Promise<void> {
  if (!config.partnerToken) {
    p.log.warn("Listar instancias e exclusivo para contas parceiras Z-API.");
    p.log.message(dim("  Contas parceiras gerenciam multiplas instancias de clientes."));
    p.log.message(dim("  Se voce tem apenas sua propria instancia, ignore esta opcao."));
    p.log.message(dim("  Para contas parceiras: painel Z-API > Parceiros > Token de autorizacao."));
    await continuePrompt();
    return mainMenu();
  }

  const s = p.spinner();
  s.start("Buscando instancias...");

  try {
    const resp = await fetch("https://api.z-api.io/instances?page=1&pageSize=50", {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${config.partnerToken}`,
      },
    });
    const text = await resp.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = text; }

    if (!resp.ok) {
      s.stop(chalk.red("Erro ao listar"));
      p.log.error(`HTTP ${resp.status}`);
      p.log.error(typeof data === "string" ? data.slice(0, 300) : JSON.stringify(data));
      p.log.message(dim("  Verifique se o Security Token tem permissoes de parceiro."));
      await continuePrompt();
      return mainMenu();
    }

    const instances = Array.isArray(data)
      ? data
      : ((data as Record<string, unknown>)["instances"] as unknown[]) || [data];
    s.stop(chalk.green(`${instances.length} instancia(s) encontrada(s)`));

    console.log("");
    for (const inst of instances) {
      const i = inst as Record<string, unknown>;
      const connected = i["connected"] === true || i["status"] === "connected";
      const statusIcon = connected ? chalk.green("●") : chalk.red("●");
      const statusText = connected ? chalk.green("connected") : chalk.red("disconnected");

      const name =
        (i["name"] as string) ||
        (i["profileName"] as string) ||
        (i["instanceName"] as string) ||
        "—";
      const id =
        (i["id"] as string) ||
        (i["instanceId"] as string) ||
        (i["instance"] as string) ||
        "";
      const phone =
        (i["phone"] as string) ||
        (i["number"] as string) ||
        (i["phoneNumber"] as string) ||
        "";
      const tokenStr =
        (i["token"] as string) ||
        (i["instanceToken"] as string) ||
        (i["accessToken"] as string) ||
        "";
      const tokenDisplay = tokenStr ? tokenStr.slice(0, 6) + "..." + tokenStr.slice(-4) : "—";

      console.log(`  ${statusIcon} ${chalk.bold.white(name)} ${dim(`(${id})`)}`);
      console.log(`    ${dim("Status:")} ${statusText}  ${dim("Numero:")} ${phone || "—"}  ${dim("Token:")} ${accent(tokenDisplay)}`);

      // Show raw keys when fields are empty (helps diagnose unknown response shape)
      const knownKeys = ["connected","status","name","profileName","instanceName","id","instanceId","instance","phone","number","phoneNumber","token","instanceToken","accessToken"];
      const unknownFields = Object.entries(i).filter(([k]) => !knownKeys.includes(k));
      if (!name || name === "—") {
        console.log(chalk.dim(`    raw: ${JSON.stringify(i).slice(0, 200)}`));
      } else if (unknownFields.length > 0) {
        const extra = unknownFields.map(([k, v]) => `${k}: ${String(v).slice(0, 30)}`).join("  ");
        console.log(chalk.dim(`    ${extra}`));
      }
      console.log("");
    }
  } catch (err) {
    s.stop(chalk.red("Falha na requisicao"));
    p.log.error(String(err));
  }

  await continuePrompt();
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

    const text = await resp.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = text; }

    const valueFalse =
      data !== null && typeof data === "object" &&
      (data as Record<string, unknown>)["value"] === false;

    if (resp.ok && !valueFalse) {
      s.stop(chalk.green("Mensagem enviada!"));
      p.log.success(typeof data === "object" ? JSON.stringify(data) : String(data));
    } else {
      s.stop(chalk.red("Falha ao enviar"));
      if (valueFalse) {
        p.log.error("A instancia retornou value: false");
        p.log.message(dim("  Verifique se a instancia esta conectada: zapi instance status"));
      } else {
        p.log.error(`HTTP ${resp.status}`);
        p.log.error(typeof data === "string" ? data.slice(0, 300) : JSON.stringify(data));
      }
    }
  } catch (err) {
    s.stop(chalk.red("Falha no envio"));
    p.log.error(String(err));
    p.log.message(dim("  Verifique sua conexao com a internet."));
  }

  await continuePrompt();
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
      { value: "instances", label: `${chalk.cyan("☰")} Listar instancias`, hint: "apenas contas parceiras Z-API" },
      { value: "send", label: `${chalk.green("✉")} Enviar mensagem`, hint: "envio rapido de texto" },
    );
  }

  options.push(
    { value: "setup", label: `${accent("⚙")} Setup wizard`, hint: isConfigured ? "reconfigurar" : "configurar agora" },
    { value: "instance-id", label: "Instance ID" },
    { value: "token", label: "Token" },
    { value: "security-token", label: "Security Token", hint: "Client-Token para instancia" },
    { value: "partner-token", label: "Partner Token", hint: "Bearer token para API de parceiro" },
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
    case "partner-token":
      return handlePartnerToken(config);
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
