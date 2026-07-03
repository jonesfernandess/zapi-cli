---
name: zapi-cli
description: zapi-cli command reference for the Z-API WhatsApp CLI. All commands, options, examples, and troubleshooting for scripting and AI agent use.
---

## Setup & Configuration

```bash
# Interactive setup wizard (first time or to update credentials)
zapi setup

# Open interactive menu
zapi menu

# Update CLI to latest version
zapi update
```

Config is stored in `~/.zapi-cli/config.json` and `~/.zapi-cli/.env`.

**Required:** `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`
**Usually required:** `ZAPI_SECURITY_TOKEN` — the Client-Token from the Z-API dashboard

The Security Token is sent as `Client-Token` header. Most production instances have it enabled.
If missing → HTTP 400 `your client-token is not configured`.
If wrong → HTTP 403 `Client-Token X not allowed`.

**Phone number format:** digits only, full international number, no `+` or dashes.
Brazil: `5511999990000` (55 + area code + number).

## Troubleshooting

```bash
# 1. Verify connection first — always start here
zapi instance status

# 2. If status shows connected: false, scan the QR code
zapi instance qr-code           # bytes
zapi instance qr-code-image     # image URL

# 3. If you get HTTP 400/403 errors, reconfigure credentials
zapi setup

# 4. If send returns {value: false}, the instance is disconnected
# Z-API returns HTTP 200 with {value: false} for failed operations.
# This is NOT a success — the message was NOT sent.
```

## Install Skills for AI Tools

```bash
zapi install-skills claude        # Claude Code (global)
zapi install-skills all           # All supported tools (global)
zapi install-skills claude --local  # Current project only

# Supported tools: claude cursor copilot cline windsurf codex gemini opencode hermes openclaw
```

## Search Documentation

```bash
zapi search-docs "send image"         # Search endpoints + guides
zapi search-docs "webhook"
zapi search-docs --list               # List all categories and sections
zapi search-docs --section "Partners" # Full section from guide
zapi search-docs "send text" --json   # Machine-readable output
zapi search-docs "send text" --pretty # Pretty JSON
```

## Instance Management

```bash
zapi instance status              # Connection status (check this first)
zapi instance restart             # Restart instance (GET internally)
zapi instance disconnect          # Disconnect (GET internally)
zapi instance me                  # Instance info
zapi instance device              # Device data
zapi instance qr-code             # QR code bytes
zapi instance qr-code-image       # QR code as image URL
zapi instance qr-code-phone       # QR code for phone pairing

# Profile (all use PUT internally)
zapi instance profile-name        --value "My Name"
zapi instance profile-description --value "My bio"
zapi instance profile-picture     --value "https://example.com/photo.jpg"

# Settings
zapi instance auto-read           --value true
zapi instance reject-calls        --value true
zapi instance reject-call-message --value "I'm busy right now"
```

## Send Messages

```bash
# Text
zapi send text --phone 5511999990000 --message "Hello!"

# Media
zapi send image    --phone 5511999990000 --image "https://..." --caption "Photo"
zapi send video    --phone 5511999990000 --video "https://..." --caption "Video"
zapi send audio    --phone 5511999990000 --audio "https://..."
zapi send ptv      --phone 5511999990000 --video "https://..."  # Push-to-talk video
zapi send gif      --phone 5511999990000 --gif "https://..."
zapi send sticker  --phone 5511999990000 --sticker "https://..."
zapi send document --phone 5511999990000 --document "https://..." --ext pdf --file-name "report.pdf"

# Location & Contact
zapi send location --phone 5511999990000 --lat -23.5505 --lng -46.6333 --title "Office"
zapi send contact  --phone 5511999990000 --contact-name "John" --contact-phone 5511888880000
zapi send contacts --phone 5511999990000 --contacts '[{"name":"John","phone":"5511888880000"}]'

# Link
zapi send link --phone 5511999990000 --message "Check this" --link-url "https://example.com"

# Interactive messages
zapi send button-actions --phone 5511999990000 --message "Choose" \
  --buttons '[{"label":"Yes"},{"label":"No"}]'

zapi send button-text --phone 5511999990000 --message "Choose" \
  --button-text "Open list" \
  --section-list '[{"title":"Section","rows":[{"title":"Option 1"}]}]'

zapi send button-image --phone 5511999990000 --message "Choose" \
  --image "https://..." --buttons '[{"label":"Buy"}]'

zapi send button-video --phone 5511999990000 --message "Choose" \
  --video "https://..." --buttons '[{"label":"Watch"}]'

zapi send button-otp  --phone 5511999990000 --message "Your code" --otp-code "123456"

zapi send option-list --phone 5511999990000 --message "Pick one" \
  --option-list '{"title":"Options","options":[{"title":"Option A"},{"title":"Option B"}]}'

zapi send button-pix  --phone 5511999990000 --message "Pay" \
  --pix-key "00000000000" --pix-type "CPF"

zapi send carousel --phone 5511999990000 --message "Products" --cards '[{...}]'

zapi send poll --phone 5511999990000 --message "Vote" \
  --poll '{"name":"Which?","values":["Yes","No"]}'

zapi send poll-vote --phone 5511999990000 --message-id "MSGID" --poll-votes '["Yes"]'

# Business
zapi send product --phone 5511999990000 --product-id "PRODID" --catalog-id "CATID"
zapi send catalog --phone 5511999990000 --catalog-id "CATID"

# Events
zapi send event --phone 5511999990000 --subject "Meeting" \
  --start-date "2026-06-01T10:00:00" --end-date "2026-06-01T11:00:00"
zapi send reply-event --phone 5511999990000 --message-id "MSGID" --action ACCEPTED

# Orders
zapi send order-approval --phone 5511999990000 --order-id "ORDERID"
zapi send order-update   --phone 5511999990000 --order-id "ORDERID" --status "SHIPPED"
zapi send order-payment  --phone 5511999990000 --order-id "ORDERID"
```

## Message Operations

```bash
zapi message delete          --message-id MSGID --phone 5511999990000 --owner true
zapi message read            --message-id MSGID --phone 5511999990000
zapi message reply           --phone 5511999990000 --message "Reply text" --message-id MSGID
zapi message react           --phone 5511999990000 --message-id MSGID --emoji "👍"
zapi message remove-reaction --phone 5511999990000 --message-id MSGID
zapi message forward         --phone 5511999990000 --message-id MSGID --conversation-from 5511888880000
zapi message pin             --phone 5511999990000 --message-id MSGID --duration 7
```

## Chat Management

```bash
zapi chat list
zapi chat metadata   --phone 5511999990000
zapi chat read       --phone 5511999990000
zapi chat archive    --phone 5511999990000 --value true
zapi chat pin        --phone 5511999990000 --value true
zapi chat mute       --phone 5511999990000 --expiration 1749330000  # -1 = forever
zapi chat expiration --phone 5511999990000 --value 604800           # 7 days (0=off, 86400=24h, 7776000=90d)
zapi chat clear      --phone 5511999990000
zapi chat delete     --phone 5511999990000
```

## Contact Management

```bash
zapi contact list
zapi contact metadata         --phone 5511999990000
zapi contact profile-picture  --phone 5511999990000
zapi contact phone-exists     --phone 5511999990000
zapi contact phone-exists-batch --phones '["5511999990000","5511888880000"]'
zapi contact block            --phone 5511999990000
zapi contact unblock          --phone 5511999990000
zapi contact report           --phone 5511999990000
zapi contact add              --contacts '[{"name":"John","phone":"5511999990000"}]'
```

## Group Management

```bash
zapi group list
zapi group create             --name "My Group" --phones '["5511999990000"]'
zapi group metadata           --group-id "GROUPID@g.us"
zapi group invitation-metadata --invite-url "https://chat.whatsapp.com/XXX"
zapi group invitation-link    --group-id "GROUPID@g.us"
zapi group reset-invite       --group-id "GROUPID@g.us"
zapi group accept-invite      --invite-code "XXXXX"

# Update group
zapi group update-name        --group-id "GROUPID@g.us" --name "New Name"
zapi group update-description --group-id "GROUPID@g.us" --description "New description"
zapi group update-photo       --group-id "GROUPID@g.us" --photo "https://..."
zapi group settings           --group-id "GROUPID@g.us" --message-admin true --edit-admin false

# Participants
zapi group add-participant     --group-id "GROUPID@g.us" --phones '["5511999990000"]'
zapi group remove-participant  --group-id "GROUPID@g.us" --phones '["5511999990000"]'
zapi group approve-participant --group-id "GROUPID@g.us" --phones '["5511999990000"]'
zapi group reject-participant  --group-id "GROUPID@g.us" --phones '["5511999990000"]'
zapi group add-admin           --group-id "GROUPID@g.us" --phones '["5511999990000"]'
zapi group remove-admin        --group-id "GROUPID@g.us" --phones '["5511999990000"]'
zapi group leave               --group-id "GROUPID@g.us"
```

## Communities

```bash
zapi community list
zapi community create          --name "My Community" --phones '["5511999990000"]'
zapi community metadata        --community-id "COMMID@g.us"
zapi community link-group      --community-id "COMMID@g.us" --group-ids '["GROUPID@g.us"]'
zapi community unlink-group    --community-id "COMMID@g.us" --group-ids '["GROUPID@g.us"]'
zapi community add-participant --community-id "COMMID@g.us" --phones '["5511999990000"]'
zapi community remove-participant --community-id "COMMID@g.us" --phones '["5511999990000"]'
zapi community promote-admin   --community-id "COMMID@g.us" --phones '["5511999990000"]'
zapi community remove-admin    --community-id "COMMID@g.us" --phones '["5511999990000"]'
zapi community settings        --community-id "COMMID@g.us" --message-admin true
zapi community reset-invite    --community-id "COMMID@g.us"
zapi community delete          --community-id "COMMID@g.us"
```

## Newsletter (Channels)

```bash
zapi newsletter list
zapi newsletter search            --query "Z-API"
zapi newsletter create            --name "My Channel" --description "About..."
zapi newsletter metadata          --newsletter-id "CHID@newsletter"
zapi newsletter follow            --newsletter-id "CHID@newsletter"
zapi newsletter unfollow          --newsletter-id "CHID@newsletter"
zapi newsletter mute              --newsletter-id "CHID@newsletter"
zapi newsletter unmute            --newsletter-id "CHID@newsletter"
zapi newsletter update-picture    --newsletter-id "CHID@newsletter" --picture "https://..."
zapi newsletter update-name       --newsletter-id "CHID@newsletter" --name "New Name"
zapi newsletter update-description --newsletter-id "CHID@newsletter" --description "New desc"
zapi newsletter delete            --newsletter-id "CHID@newsletter"
```

## Status (Stories)

```bash
zapi status text  --message "Hello world!" --background-color "#128C7E"
zapi status image --image "https://..."
zapi status video --video "https://..."
```

## Webhooks

```bash
# Set all events to the same URL at once
zapi webhook set-all --value "https://myapp.com/webhook"

# Configure individual event webhooks (all use PUT internally)
zapi webhook on-send           --value "https://myapp.com/on-send"
zapi webhook on-receive        --value "https://myapp.com/on-receive"
zapi webhook on-receive-self   --value "https://myapp.com/on-receive-self"
zapi webhook on-disconnect     --value "https://myapp.com/on-disconnect"
zapi webhook on-message-status --value "https://myapp.com/on-message-status"
zapi webhook on-chat-status    --value "https://myapp.com/on-chat-status"
zapi webhook on-connect        --value "https://myapp.com/on-connect"

# Toggle self-message notifications
zapi webhook notify-sent-by-me --value true
```

## Privacy

```bash
zapi privacy blocked-list                       # List blocked contacts
zapi privacy last-seen        --value all       # all | contacts | none
zapi privacy profile-photo    --value contacts
zapi privacy about            --value contacts  # Profile description visibility
zapi privacy group-permission --value contacts  # Who can add you to groups
zapi privacy online           --value true
zapi privacy read-receipts    --value true
zapi privacy message-duration --value 7days    # off | 24hours | 7days | 90days
```

## Message Queue

```bash
zapi queue get
zapi queue clear
zapi queue delete-item --message-id MSGID
```

## Business — Products

```bash
zapi business edit-product      --name "Product" --image "https://..." --price "29.90"
zapi business products
zapi business product           --product-id "PRODID"
zapi business products-by-phone --phone 5511999990000
zapi business delete-product    --product-id "PRODID"
```

## Business — Labels (Etiquetas)

```bash
zapi label list
zapi label colors
zapi label create --name "VIP"   --color "red"
zapi label edit   --label-id "LABELID" --name "VIP+" --color "green"
zapi label delete --label-id "LABELID"
zapi label assign --phone 5511999990000 --label-ids '["LABELID"]'
zapi label remove --phone 5511999990000 --label-ids '["LABELID"]'
```

## Business — Collections

```bash
zapi collection list
zapi collection create          --name "Summer"
zapi collection edit            --collection-id "COLID" --name "Summer 2026"
zapi collection delete          --collection-id "COLID"
zapi collection products        --collection-id "COLID"
zapi collection add-products    --collection-id "COLID" --product-ids '["PRODID"]'
zapi collection remove-products --collection-id "COLID" --product-ids '["PRODID"]'
```

## Business — Profile

```bash
zapi business-profile description      --value "Best shop in town"
zapi business-profile email            --value "contact@shop.com"
zapi business-profile address          --value "123 Main St"
zapi business-profile websites         --websites '["https://shop.com"]'
zapi business-profile categories                         # List available categories
zapi business-profile assign-category  --category-id "CATID"
```

## Partner / Admin

Partner commands that create/list instances use absolute Z-API URLs (not instance-scoped).
The Client-Token must be a partner-level security token.

```bash
zapi partner list-instances                    # GET https://api.z-api.io/instances
zapi partner list-instances --page 2 --page-size 20
zapi partner create-instance --name "Client"  # POST https://api.z-api.io/instances/integrator/on-demand
zapi partner sign-instance   --instance-id "INSTID"
zapi partner cancel-instance --instance-id "INSTID"
```

## Calls

```bash
zapi calls send --phone 5511999990000
```
