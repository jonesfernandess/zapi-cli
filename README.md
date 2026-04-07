# zapi-cli

> **Aviso:** Esta e uma ferramenta **nao oficial**, criada pela comunidade. **Nao possui nenhum vinculo, endosso ou associacao com a Z-API.** Use por sua conta e risco.

**[English](README.en.md) | [Espanol](README.es.md)**

Uma interface de linha de comando para a API de WhatsApp da [Z-API](https://z-api.io). Gerencie sua instancia, envie mensagens, administre grupos, contatos, webhooks e muito mais — tudo pelo terminal.

## O problema

A Z-API expoe uma API REST poderosa para automacao de WhatsApp. Mas interagir com ela significa ficar lidando com comandos `curl`, lembrando paths de endpoints, montando payloads JSON e construindo URLs com IDs e tokens de autenticacao manualmente.

**zapi-cli** encapsula toda a superficie da Z-API em um unico binario com:

- Um **menu interativo** para operacoes rapidas (testar conexao, enviar mensagem, ver QR code)
- Uma **CLI completa** com subcomandos para scripts e automacao (`zapi send text --to 5511... --message "ola"`)
- Um **wizard de configuracao** que salva o ID e os tokens da instancia uma unica vez
- **Auto-atualizacao** embutida — rode `zapi update` a qualquer momento

Chega de copiar e colar tokens em URLs ou consultar a documentacao a cada request.

![Z-API CLI menu interativo](screenshot.jpeg)

## Instalacao

Um comando:

```bash
curl -fsSL https://raw.githubusercontent.com/jonesfernandess/zapi-cli/main/install.sh | bash
```

O script verifica Node.js 18+ e npm, clona o repositorio em `~/.zapi-cli-app`, compila e instala o comando `zapi` globalmente.

**Requisitos:** Node.js 18+, npm, git.

## Inicio rapido

```bash
# 1. Instalar
curl -fsSL https://raw.githubusercontent.com/jonesfernandess/zapi-cli/main/install.sh | bash

# 2. Configurar — abre o wizard de setup
zapi setup

# 3. Testar a conexao
zapi instance status

# 4. Enviar sua primeira mensagem
zapi send text --to 5511999999999 --message "Ola do terminal!"
```

Ou rode `zapi` sem argumentos para abrir o menu interativo.

## Atualizacao

Atualize para a versao mais recente a qualquer momento:

```bash
zapi update
```

`zapi upgrade` tambem funciona. O comando puxa o codigo mais recente do GitHub, reinstala dependencias e recompila automaticamente.

## Uso

### Modo interativo

Rode `zapi` sem argumentos:

```
  Z-API CLI — WhatsApp API from the terminal

  ● O que deseja fazer?
  ● ⚡ Testar conexao      (verifica status da instancia)
  ○ ✉  Enviar mensagem     (envio rapido de texto)
  ○ 📱 QR Code             (conectar instancia)
  ○ ⚙  Setup wizard
  ○ ✕  Sair
```

### Modo CLI

Para scripts e automacao:

```
zapi [comando] [subcomando] [opcoes]
```

### Comandos

| Comando | Descricao |
|---------|-----------|
| `instance` | Gerenciar instancia WhatsApp (conectar, desconectar, status, QR code) |
| `send` | Enviar mensagens (texto, imagem, video, audio, documento, sticker, GIF, localizacao, contato, PIX, enquete, carrossel) |
| `message` | Gerenciar mensagens (deletar, ler, responder, reagir, encaminhar, fixar) |
| `chat` | Gerenciar conversas (listar, arquivar, silenciar, fixar, limpar, deletar) |
| `group` | Gerenciar grupos do WhatsApp (criar, participantes, admin, metadados) |
| `contact` | Gerenciar contatos (listar, verificar WhatsApp, bloquear, foto de perfil) |
| `webhook` | Configurar webhooks |
| `newsletter` | Gerenciar Canais do WhatsApp |
| `business` | Produtos, etiquetas, catalogo |
| `status` | Publicar Stories no WhatsApp |
| `community` | Gerenciar comunidades |
| `queue` | Gerenciamento de fila de mensagens |
| `privacy` | Configuracoes de privacidade |
| `partner` | Operacoes de parceiro/admin |
| `calls` | Realizar chamadas no WhatsApp |
| `setup` | Wizard de configuracao interativo |
| `update` | Atualizar para a versao mais recente |

### Exemplos

```bash
# Verificar status da instancia
zapi instance status

# Obter QR code para conectar
zapi instance qr

# Enviar mensagem de texto
zapi send text --to 5511999999999 --message "Ola!"

# Enviar imagem
zapi send image --to 5511999999999 --url https://exemplo.com/foto.jpg

# Enviar documento
zapi send document --to 5511999999999 --url https://exemplo.com/arquivo.pdf

# Enviar enquete
zapi send poll --to 5511999999999 --title "Qual a melhor opcao?" --options "A,B,C"

# Publicar um Story no WhatsApp
zapi status text --message "Novidade!"

# Configurar webhook
zapi webhook set --url https://seu-servidor.com/webhook

# Listar todos os grupos
zapi group list

# Ajuda de qualquer comando
zapi send --help
zapi instance connect --help
```

## Configuracao

Na primeira execucao, o wizard cria `~/.zapi-cli/config.json`:

```json
{
  "instanceId": "SUA-INSTANCE-ID",
  "token": "SEU-TOKEN-DE-INSTANCIA",
  "securityToken": ""
}
```

| Campo | Descricao |
|-------|-----------|
| `instanceId` | ID da instancia Z-API |
| `token` | Token da instancia |
| `securityToken` | Token de seguranca (opcional, para validacao de webhooks) |

A autenticacao na Z-API e feita via path da URL (`/instances/{instanceId}/token/{token}/...`), sem headers adicionais.

Voce pode reconfigurar a qualquer momento com `zapi setup` ou alterar valores individuais pelo menu interativo.

## Build local

```bash
git clone https://github.com/jonesfernandess/zapi-cli.git
cd zapi-cli
npm install
npm run build
npm install -g .
```

### Desenvolvimento

```bash
npm run dev      # Rodar com tsx (sem build)
npm run build    # Compilar TypeScript para dist/
npm run lint     # Verificar tipos sem emitir arquivos
```

## Stack

- **TypeScript** + **Commander.js** para o framework CLI
- **@clack/prompts** para o menu interativo
- **chalk** + **gradient-string** + **figlet** para estilizacao no terminal

## Licenca

MIT
