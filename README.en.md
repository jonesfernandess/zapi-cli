# zapi-cli

> **Disclaimer:** This is an **unofficial**, community-built CLI tool. It is **not affiliated with, endorsed by, or associated with Z-API** in any way. Use at your own risk.

**[Portugues](README.md) | [Espanol](README.es.md)**

A command-line interface for the [Z-API](https://z-api.io) WhatsApp API. Manage your WhatsApp instance, send messages, handle groups, contacts, webhooks and more — all from the terminal.

## The problem

Z-API exposes a powerful REST API for WhatsApp automation. But interacting with it means juggling `curl` commands, remembering endpoint paths, building JSON payloads, and constructing URLs with authentication IDs and tokens manually.

**zapi-cli** wraps the entire Z-API surface into a single binary with:

- An **interactive menu** for quick operations (test connection, send a message, get QR code)
- A **full CLI** with subcommands for scripting and automation (`zapi send text --to 5511... --message "hello"`)
- A **setup wizard** that configures your instance ID and tokens once
- **Self-update** built in — run `zapi update` anytime

No more copy-pasting tokens into URLs or looking up endpoint docs for every request.

![Z-API CLI interactive menu](screenshot.jpeg)

## Install

One command:

```bash
curl -fsSL https://raw.githubusercontent.com/jonesfernandess/zapi-cli/main/install.sh | bash
```

This checks for Node.js 18+ and npm, clones the repo to `~/.zapi-cli-app`, builds it, and installs the `zapi` command globally.

**Requirements:** Node.js 18+, npm, git.

## Quick start

```bash
# 1. Install
curl -fsSL https://raw.githubusercontent.com/jonesfernandess/zapi-cli/main/install.sh | bash

# 2. Configure — opens the setup wizard
zapi setup

# 3. Test your connection
zapi instance status

# 4. Send your first message
zapi send text --to 5511999999999 --message "Hello from the terminal!"
```

Or just run `zapi` with no arguments to open the interactive menu.

## Update

Update to the latest version at any time:

```bash
zapi update
```

`zapi upgrade` also works. This pulls the latest code from GitHub, reinstalls dependencies, and rebuilds automatically.

## Usage

### Interactive mode

Run `zapi` with no arguments:

```
  Z-API CLI — WhatsApp API from the terminal

  ● What do you want to do?
  ● ⚡ Test connection     (check instance status)
  ○ ✉  Send message        (quick text send)
  ○ 📱 QR Code             (connect instance)
  ○ ⚙  Setup wizard
  ○ ✕  Exit
```

### CLI mode

For scripting and automation:

```
zapi [command] [subcommand] [options]
```

### Commands

| Command | Description |
|---------|-------------|
| `instance` | Manage WhatsApp instance (connect, disconnect, status, QR code) |
| `send` | Send messages (text, image, video, audio, document, sticker, GIF, location, contact, PIX, poll, carousel) |
| `message` | Manage messages (delete, read, reply, react, forward, pin) |
| `chat` | Manage chats (list, archive, mute, pin, clear, delete) |
| `group` | Manage WhatsApp groups (create, participants, admin, metadata) |
| `contact` | Manage contacts (list, check WhatsApp, block, profile picture) |
| `webhook` | Configure webhooks |
| `newsletter` | Manage WhatsApp Channels |
| `business` | Products, tags, catalog |
| `status` | Post WhatsApp Stories |
| `community` | Manage communities |
| `queue` | Message queue management |
| `privacy` | Privacy settings |
| `partner` | Partner/admin operations |
| `calls` | Make WhatsApp calls |
| `setup` | Interactive setup wizard |
| `update` | Update to latest version |

### Examples

```bash
# Check instance status
zapi instance status

# Get QR code to connect
zapi instance qr

# Send a text message
zapi send text --to 5511999999999 --message "Hello!"

# Send an image
zapi send image --to 5511999999999 --url https://example.com/photo.jpg

# Send a document
zapi send document --to 5511999999999 --url https://example.com/file.pdf

# Send a poll
zapi send poll --to 5511999999999 --title "What's the best option?" --options "A,B,C"

# Post a WhatsApp Story
zapi status text --message "New update!"

# Manage webhooks
zapi webhook set --url https://your-server.com/webhook

# List all groups
zapi group list

# Get help for any command
zapi send --help
zapi instance connect --help
```

## Configuration

On first run, the setup wizard creates `~/.zapi-cli/config.json`:

```json
{
  "instanceId": "YOUR-INSTANCE-ID",
  "token": "YOUR-INSTANCE-TOKEN",
  "securityToken": ""
}
```

| Field | Description |
|-------|-------------|
| `instanceId` | Z-API instance ID |
| `token` | Instance token |
| `securityToken` | Security token (optional, for webhook validation) |

Z-API authentication is done via URL path (`/instances/{instanceId}/token/{token}/...`), not through headers.

You can reconfigure anytime with `zapi setup` or change individual values from the interactive menu.

## Build from source

```bash
git clone https://github.com/jonesfernandess/zapi-cli.git
cd zapi-cli
npm install
npm run build
npm install -g .
```

### Development

```bash
npm run dev      # Run with tsx (no build step)
npm run build    # Compile TypeScript to dist/
npm run lint     # Type-check without emitting
```

## Tech stack

- **TypeScript** + **Commander.js** for the CLI framework
- **@clack/prompts** for the interactive menu
- **chalk** + **gradient-string** + **figlet** for terminal styling

## License

MIT
