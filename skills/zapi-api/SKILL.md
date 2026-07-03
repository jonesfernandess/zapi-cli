---
name: zapi-api
description: Z-API REST API reference for WhatsApp integrations. Complete endpoint contracts — method, URL path, auth, body fields, response shapes, and known gotchas. Use this to implement Z-API in any language.
---

## Authentication

Z-API uses URL-based authentication. Every instance-scoped endpoint uses:

```
https://api.z-api.io/instances/{instanceId}/token/{instanceToken}/{endpoint}
```

**Required headers for every request:**
```
Content-Type: application/json
Accept: application/json
Client-Token: {securityToken}    ← REQUIRED if configured on the instance
```

The `Client-Token` header is **not optional** for most production instances. If not sent
when the instance requires it, Z-API returns HTTP 400 `{"error":"your client-token is not configured"}`.
If sent with the wrong value, it returns HTTP 403 `{"error":"Client-Token X not allowed"}`.
Find the Security Token in the Z-API dashboard under the instance's Security settings.

**Environment variables (used by zapi-cli):**
- `ZAPI_INSTANCE_ID` — instance ID
- `ZAPI_TOKEN` — instance token
- `ZAPI_SECURITY_TOKEN` — security token sent as `Client-Token` header

**Phone number format:** full international number, digits only, no `+` or spaces.
Brazil example: `5511999990000` (55 = country, 11 = area code, 9-digit number).

## Critical: value:false means failure

Z-API frequently returns **HTTP 200** with `{"value": false}` to indicate failure
(disconnected instance, invalid phone, etc.). Never treat HTTP 200 alone as success —
always check the response body. A successful send returns fields like `zaapId` and `messageId`.

```json
// Failure (HTTP 200, but operation did not execute):
{"value": false}

// Success:
{"zaapId": "ZAAP_ID", "messageId": "MSG_ID", "id": "ID"}
```

## Instance endpoints

All instance endpoints are scoped to `{base}/{endpoint}` where `base` is the instance URL above.

**GET /status** — Connection status.
Response: `{ connected: bool, smartphoneConnected: bool, session: string, phone: string }`

**GET /restart** — Restart the instance. *(uses GET, not POST)*

**GET /disconnect** — Disconnect from WhatsApp. *(uses GET, not POST)*

**GET /me** — Instance info/data.

**GET /device** — Connected device data.

**GET /qr-code** — QR code bytes for connection.

**GET /qr-code/image** — QR code as image URL.

**GET /qr-code/phone** — QR code for phone number pairing.

**PUT /profile-name** `{ value: string }` — Update display name. *(PUT, not POST)*

**PUT /profile-picture** `{ value: string }` — Update profile picture (URL or base64). *(PUT, not POST)*

**PUT /profile-description** `{ value: string }` — Update profile description/bio. *(PUT, not POST)*

**PUT /update-auto-read-message** `{ value: bool }` — Toggle auto-read. *(PUT, not POST)*

**PUT /update-call-reject-auto** `{ value: bool }` — Auto-reject calls.

**PUT /update-call-reject-message** `{ value: string }` — Call rejection message.

## Messages — Send

All send endpoints: `POST {base}/{endpoint}` with JSON body containing at minimum `phone`.

**POST /send-text** `{ phone, message }` — Plain text.

**POST /send-image** `{ phone, image, caption? }` — Image from URL.

**POST /send-sticker** `{ phone, sticker }` — Sticker from URL.

**POST /send-gif** `{ phone, gif }` — GIF from URL.

**POST /send-audio** `{ phone, audio }` — Audio from URL.

**POST /send-video** `{ phone, video, caption? }` — Video from URL.

**POST /send-ptv** `{ phone, video }` — PTV (push-to-talk video).

**POST /send-document/{ext}** `{ phone, document, fileName? }` — Document. `ext` in path = pdf, docx, xlsx, etc.

**POST /send-link** `{ phone, message, linkUrl, image?, title?, linkDescription? }` — Link with preview.

**POST /send-location** `{ phone, lat, lng, title?, address? }` — Geographic location.

**POST /send-contact** `{ phone, contactName, contactPhone }` — Single contact vCard.

**POST /send-contacts** `{ phone, contacts: [{name, phone}] }` — Multiple contacts.

**POST /send-button-actions** `{ phone, message, buttons: [{label, id?}], title?, footer? }` — Action buttons.

**POST /send-button-list** `{ phone, message, buttonText, sectionList: [{title, rows:[{title, description?, rowId?}]}], title?, footer? }` — List message (button opens a list).

**POST /send-image-actions** `{ phone, message, image, buttons: [{label, id?}], title?, footer? }` — Image with action buttons.

**POST /send-video-actions** `{ phone, message, video, buttons: [{label, id?}], title?, footer? }` — Video with action buttons.

**POST /send-option-list** `{ phone, message, optionList: {title, options:[{title, description?, optionId?}]}, title?, footer? }` — Option list.

**POST /send-button-otp** `{ phone, message, otpCode }` — OTP button.

**POST /send-button-pix** `{ phone, message, pixKey, pixType }` — PIX payment button. `pixType`: CPF|CNPJ|PHONE|EMAIL|EVP.

**POST /send-product** `{ phone, productId, catalogId?, message? }` — Send a product from catalog.

**POST /send-catalog** `{ phone, catalogId, message? }` — Send full catalog.

**POST /send-poll** `{ phone, message, poll: {name, values: [], selectableCount?} }` — Poll.

**POST /send-poll-vote** `{ phone, messageId, pollVotes: [string] }` — Vote on a poll.

**POST /send-carousel** `{ phone, message, cards: [{...}] }` — Carousel of cards.

**POST /send-event** `{ phone, subject, description?, startDate, endDate, location? }` — Event message.

**POST /reply-event** `{ phone, messageId, action }` — RSVP. `action`: ACCEPTED|DECLINED|TENTATIVE.

**POST /send-order-approval** `{ phone, orderId }` — Send order approval.

**POST /send-order-status** `{ phone, orderId, status }` — Order status update.

**POST /send-order-payment** `{ phone, orderId }` — Order payment update.

## Messages — Manage

**DELETE /delete-message** `{ messageId, phone, owner: bool }` — Delete a message.

**POST /read-message** `{ messageId, phone }` — Mark as read.

**POST /reply-message** `{ phone, message, messageId, replyFrom? }` — Reply.

**POST /send-reaction** `{ phone, messageId, emoji }` — Add emoji reaction.

**POST /remove-reaction** `{ phone, messageId }` — Remove reaction.

**POST /forward-message** `{ phone, messageId, conversationFrom }` — Forward message.

**POST /pin-message** `{ phone, messageId, duration }` — Pin. `duration`: 0 (unpin), 7, 30 (days).

**POST /edit-event** `{ ... }` — Edit an event message.

## Chats

**GET /chats** — List all chats.

**GET /chats/{phone}** — Get chat metadata.

**POST /read-chat** `{ phone }` — Mark chat as read.

**POST /archive-chat** `{ phone, value: bool }` — Archive/unarchive.

**POST /pin-chat** `{ phone, value: bool }` — Pin/unpin.

**POST /mute-chat** `{ phone, expiration: timestamp }` — Mute. `-1` = forever.

**POST /clear-chat** `{ phone }` — Clear messages.

**POST /delete-chat** `{ phone }` — Delete chat.

**POST /message-expiration** `{ phone, expiration: number }` — Set disappearing messages. Values: 0 (off), 86400 (24h), 604800 (7d), 7776000 (90d).

## Contacts

**GET /contacts** — List contacts.

**GET /contact/{phone}** — Get contact metadata.

**GET /profile-picture/{phone}** — Get contact profile picture.

**GET /phone-exists/{phone}** — Check if number has WhatsApp.

**POST /phone-exists-batch** `{ phones: [string] }` — Batch WhatsApp check.

**POST /block-contact** `{ phone }` — Block a contact.

**POST /unblock-contact** `{ phone }` — Unblock a contact.

**POST /report-contact** `{ phone }` — Report a contact.

## Groups

**GET /groups** — List all groups.

**POST /create-group** `{ groupName, phones: [string] }` — Create group.

**POST /update-group-name** `{ groupId, groupName }` — Rename group.

**POST /update-group-description** `{ groupId, description }` — Update description.

**POST /update-group-photo** `{ groupId, groupPhoto }` — Update group photo.

**POST /add-participant** `{ groupId, phones: [string] }` — Add participants.

**POST /remove-participant** `{ groupId, phones: [string] }` — Remove participants.

**POST /approve-participant** `{ groupId, phones: [string] }` — Approve pending participants.

**POST /reject-participant** `{ groupId, phones: [string] }` — Reject pending participants.

**POST /add-admin** `{ groupId, phones: [string] }` — Promote to admin.

**POST /remove-admin** `{ groupId, phones: [string] }` — Demote admin.

**POST /leave-group** `{ groupId }` — Leave group.

**GET /group-metadata/{groupId}** — Group details.

**GET /group-invitation-metadata/{inviteUrl}** — Info from invite URL.

**GET /invitation-link/{groupId}** — Get current invite link.

**POST /reset-invitation-link** `{ groupId }` — Reset invite link.

**GET /accept-invitation/{inviteCode}** — Accept group invite by code.

**POST /group-settings** `{ groupId, messageAdmin?: bool, editAdmin?: bool }` — Group settings.

## Communities

**POST /create-community** `{ communityName, communityDescription?, phones: [string] }` — Create.

**GET /communities** — List communities.

**GET /community-metadata/{communityId}** — Community details.

**POST /link-group** `{ communityId, groupIds: [string] }` — Link groups.

**POST /unlink-group** `{ communityId, groupIds: [string] }` — Unlink groups.

**POST /add-participant-community** `{ communityId, phones: [string] }` — Add participants.

**POST /remove-participant-community** `{ communityId, phones: [string] }` — Remove participants.

**POST /add-admin-community** `{ communityId, phones: [string] }` — Promote to admin.

**POST /remove-admin-community** `{ communityId, phones: [string] }` — Demote admin.

**POST /community-settings** `{ communityId, messageAdmin?: bool }` — Settings.

**POST /reset-invitation-link-community** `{ communityId }` — Reset invite link.

**DELETE /delete-community** `{ communityId }` — Delete community.

## Newsletter (Channels)

**POST /create-newsletter** `{ name, description? }` — Create.

**PUT /follow-newsletter** `{ newsletterId }` — Follow.

**PUT /unfollow-newsletter** `{ newsletterId }` — Unfollow.

**PUT /mute-newsletter** `{ newsletterId }` — Mute.

**PUT /unmute-newsletter** `{ newsletterId }` — Unmute.

**POST /update-newsletter-picture** `{ newsletterId, picture }` — Update picture.

**POST /update-newsletter-name** `{ newsletterId, name }` — Update name.

**POST /update-newsletter-description** `{ newsletterId, description }` — Update description.

**DELETE /delete-newsletter** `{ newsletterId }` — Delete.

**GET /newsletter-metadata/{newsletterId}** — Get metadata.

**GET /newsletters** — List newsletters.

**POST /search-newsletters** `{ query }` — Search public newsletters.

## Status (Stories)

**POST /send-text-status** `{ message, backgroundColor? }` — Text status.

**POST /send-image-status** `{ image }` — Image status.

**POST /send-video-status** `{ video }` — Video status.

## Webhooks

All webhook endpoints use **PUT** on the instance-scoped URL.

**PUT /update-every-webhooks** `{ value: url }` — Set all events to same URL at once.

**PUT /update-webhook-on-send** `{ value: url }` — On message sent by you.

**PUT /update-webhook-received** `{ value: url }` — On message received.

**PUT /update-webhook-received-sent-by-me** `{ value: url }` — On received (including self-sent).

**PUT /update-webhook-on-disconnect** `{ value: url }` — On disconnect event.

**PUT /update-webhook-message-status** `{ value: url }` — On message status (sent/delivered/read).

**PUT /update-webhook-chat-status** `{ value: url }` — On chat status update.

**PUT /update-webhook-on-connected** `{ value: url }` — On connect event.

**PUT /update-notify-sent-by-me** `{ value: bool }` — Include self-sent messages in received webhook.

## Privacy

**GET /blocked-contacts** — List blocked contacts.

**POST /last-seen** `{ value }` — Last seen visibility. Values: `all` | `contacts` | `none`.

**POST /profile-photo-visualization** `{ value }` — Profile photo visibility. Values: `all` | `contacts` | `none`.

**POST /about-privacy** `{ value }` — About/bio visibility. Values: `all` | `contacts` | `none`.

**POST /groups-privacy** `{ value }` — Who can add you to groups. Values: `all` | `contacts` | `none`.

**POST /online-privacy** `{ value: bool }` — Online visibility.

**POST /read-receipts** `{ value: bool }` — Read receipts (blue ticks).

**POST /temporary-messages** `{ value }` — Default disappearing messages. Values: `off` | `24hours` | `7days` | `90days`.

## Message Queue

**GET /queue** — List queued messages.

**DELETE /queue** — Clear all queued messages.

**DELETE /queue/{messageId}** — Remove specific message from queue.

## WhatsApp Business — Products

**POST /edit-product** `{ name, image, description?, price?, url?, isHidden? }` — Create/update product.

**GET /products** — List all products.

**GET /products/{phone}** — Products for a contact.

**GET /product/{productId}** — Get product by ID.

**DELETE /delete-product/{productId}** — Delete product.

## WhatsApp Business — Labels (Etiquetas)

**GET /labels** — List all labels.

**GET /label-colors** — Available label colors.

**POST /label** `{ name, color }` — Create label.

**POST /label/{labelId}** `{ name, color }` — Edit label.

**DELETE /label/{labelId}** — Delete label.

**PUT /assign-label** `{ phone, labelIds: [string] }` — Assign labels to chat.

**PUT /remove-label** `{ phone, labelIds: [string] }` — Remove labels from chat.

## WhatsApp Business — Collections

**POST /create-collection** `{ name }` — Create collection.

**GET /collections** — List collections.

**POST /collection/{collectionId}** `{ name }` — Edit collection.

**DELETE /collection/{collectionId}** — Delete collection.

**GET /collection/{collectionId}/products** — Products in collection.

**POST /collection/{collectionId}/products** `{ productIds: [string] }` — Add products.

**DELETE /collection/{collectionId}/products** `{ productIds: [string] }` — Remove products.

## WhatsApp Business — Profile

**POST /business-description** `{ value }` — Update business description.

**POST /business-email** `{ value }` — Update business email.

**POST /business-address** `{ value }` — Update business address.

**POST /business-websites** `{ websites: [string] }` — Update websites.

**GET /business-categories** — List available business categories.

**POST /assign-business-category** `{ categoryId }` — Assign category.

## Partners

Partner endpoints that are **NOT** instance-scoped use the base Z-API URL directly.
The `Client-Token` header must still be sent with a partner-level security token.

**POST https://api.z-api.io/instances/integrator/on-demand**
`{ name }` — Create a new instance. *(absolute URL, no instance/token in path)*

**GET https://api.z-api.io/instances?page=1&pageSize=50**
— List all instances. *(absolute URL, no instance/token in path)*

**POST {base}/integrator/on-demand/subscription**
`{ instanceId }` — Sign/activate an instance. *(instance-scoped)*

**POST {base}/integrator/on-demand/cancel**
`{ instanceId }` — Cancel an instance. *(instance-scoped)*

## Calls

**POST /send-call** `{ phone }` — Initiate a WhatsApp call.
