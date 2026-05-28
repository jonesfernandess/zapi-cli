---
name: zapi-api
description: Z-API REST API reference for WhatsApp integrations. Complete endpoint contracts — method, URL path, auth, body fields, and response shapes. Use this to implement Z-API in any language.
---

## Authentication

Z-API uses URL-based authentication. Every endpoint is scoped to a specific instance:

```
https://api.z-api.io/instances/{instanceId}/token/{instanceToken}/{endpoint}
```

Optional security header (when security token is configured on the instance):
```
Client-Token: {securityToken}
```

Environment variables used by zapi-cli:
- `ZAPI_INSTANCE_ID` — instance ID
- `ZAPI_TOKEN` — instance token
- `ZAPI_SECURITY_TOKEN` — optional security token (sent as Client-Token header)

## Instance

**GET /status** — Connection status. Returns `{ connected: bool, smartphoneConnected: bool, ... }`

**GET /restart** — Restart the instance.

**GET /disconnect** — Disconnect from WhatsApp.

**GET /me** — Instance info/data.

**GET /device** — Connected device data.

**GET /qr-code** — QR code bytes for connection.

**GET /qr-code/image** — QR code as image.

**GET /qr-code/phone** — QR code for phone number pairing.

**PUT /profile-name** `{ value: string }` — Update display name.

**PUT /profile-picture** `{ value: string }` — Update profile picture (URL or base64).

**PUT /profile-description** `{ value: string }` — Update profile description/bio.

**PUT /update-auto-read-message** `{ value: bool }` — Toggle auto-read.

**POST /restart** — Restart instance.

**PUT /update-call-reject-auto** `{ value: bool }` — Auto-reject calls.

**PUT /update-call-reject-message** `{ value: string }` — Call rejection message.

## Messages — Send

All send endpoints are POST with body containing at minimum `phone` (recipient number).

**POST /send-text** `{ phone, message }` — Plain text.

**POST /send-image** `{ phone, image, caption? }` — Image from URL.

**POST /send-sticker** `{ phone, sticker }` — Sticker from URL.

**POST /send-gif** `{ phone, gif }` — GIF from URL.

**POST /send-audio** `{ phone, audio }` — Audio from URL.

**POST /send-video** `{ phone, video, caption? }` — Video from URL.

**POST /send-ptv** `{ phone, video }` — PTV (push-to-talk video).

**POST /send-document/{ext}** `{ phone, document, fileName? }` — Document. `ext` = pdf, docx, xlsx, etc.

**POST /send-link** `{ phone, message, linkUrl, image?, title?, linkDescription? }` — Link with preview.

**POST /send-location** `{ phone, lat, lng, title?, address? }` — Geographic location.

**POST /send-contact** `{ phone, contactName, contactPhone }` — Single contact vCard.

**POST /send-contacts** `{ phone, contacts: [{name, phone}] }` — Multiple contacts.

**POST /send-button-actions** `{ phone, message, buttons: [{label, id?}], title?, footer? }` — Action buttons.

**POST /send-button-list** `{ phone, message, buttonText, sectionList: [{title, rows:[{title,description?,rowId?}]}], title?, footer? }` — List message.

**POST /send-button-actions** `{ phone, message, buttons, title?, footer? }` — Text with action buttons.

**POST /send-image-actions** `{ phone, message, image, buttons, title?, footer? }` — Image with buttons.

**POST /send-video-actions** `{ phone, message, video, buttons, title?, footer? }` — Video with buttons.

**POST /send-option-list** `{ phone, message, optionList: {title, options:[{title,description?,optionId?}]}, title?, footer? }` — Option list.

**POST /send-button-otp** `{ phone, message, otpCode }` — OTP button.

**POST /send-button-pix** `{ phone, message, pixKey, pixType }` — PIX payment button. `pixType`: CPF|CNPJ|PHONE|EMAIL|EVP.

**POST /send-product** `{ phone, productId, catalogId?, message? }` — Send a product from catalog.

**POST /send-catalog** `{ phone, catalogId, message? }` — Send full catalog.

**POST /send-poll** `{ phone, message, poll: {name, values:[], selectableCount?} }` — Poll.

**POST /send-poll-vote** `{ phone, messageId, pollVotes: [string] }` — Vote on a poll.

**POST /send-carousel** `{ phone, message, cards: [{...}] }` — Carousel of cards.

**POST /send-event** `{ phone, subject, description?, startDate, endDate, location?, ... }` — Event message.

**POST /reply-event** `{ phone, messageId, action }` — RSVP event. `action`: ACCEPTED|DECLINED|TENTATIVE.

**POST /send-order-approval** `{ phone, orderId, ... }` — Send order approval.

**POST /send-order-status** `{ phone, orderId, status, ... }` — Order status update.

**POST /send-order-payment** `{ phone, orderId, ... }` — Order payment update.

## Messages — Manage

**DELETE /delete-message** `{ messageId, phone, owner: bool }` — Delete a message.

**POST /read-message** `{ messageId, phone }` — Mark as read.

**POST /reply-message** `{ phone, message, messageId, replyFrom? }` — Reply.

**POST /send-reaction** `{ phone, messageId, emoji }` — Add reaction.

**POST /remove-reaction** `{ phone, messageId }` — Remove reaction.

**POST /forward-message** `{ phone, messageId, conversationFrom }` — Forward.

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

All webhook endpoints use PUT method.

**PUT /update-every-webhooks** `{ value: url }` — Set all webhook events to same URL.

**PUT /update-webhook-on-send** `{ value: url }` — On message sent.

**PUT /update-webhook-received** `{ value: url }` — On message received.

**PUT /update-webhook-received-sent-by-me** `{ value: url }` — On received (including sent by me).

**PUT /update-webhook-on-disconnect** `{ value: url }` — On disconnect.

**PUT /update-webhook-message-status** `{ value: url }` — On message status update.

**PUT /update-webhook-chat-status** `{ value: url }` — On chat status update.

**PUT /update-webhook-on-connected** `{ value: url }` — On connect.

**PUT /update-notify-sent-by-me** `{ value: bool }` — Include self-sent messages.

## Privacy

**GET /blocked-contacts** — List blocked contacts.

**POST /last-seen** `{ value }` — Last seen visibility. Values: `all` | `contacts` | `none`.

**POST /profile-photo-visualization** `{ value }` — Profile photo visibility. Values: `all` | `contacts` | `none`.

**POST /about-privacy** `{ value }` — About/bio visibility. Values: `all` | `contacts` | `none`.

**POST /groups-privacy** `{ value }` — Who can add to groups. Values: `all` | `contacts` | `none`.

**POST /online-privacy** `{ value: bool }` — Online visibility.

**POST /read-receipts** `{ value: bool }` — Read receipts (blue ticks).

**POST /temporary-messages** `{ value }` — Default message expiration. Values: `off` | `24hours` | `7days` | `90days`.

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

**POST /catalog-config** `{ ... }` — Catalog configuration.

**POST /create-collection** `{ name }` — Create collection.

**GET /collections** — List collections.

**DELETE /collection/{collectionId}** — Delete collection.

**POST /collection/{collectionId}** `{ name }` — Edit collection.

**GET /collection/{collectionId}/products** — Products in collection.

**POST /collection/{collectionId}/products** `{ productIds: [string] }` — Add products.

**DELETE /collection/{collectionId}/products** `{ productIds: [string] }` — Remove products.

## WhatsApp Business — Profile

**POST /business-description** `{ value }` — Update business description.

**POST /business-email** `{ value }` — Update business email.

**POST /business-address** `{ value }` — Update business address.

**POST /business-websites** `{ websites: [string] }` — Update websites.

**POST /business-hours** `{ ... }` — Update business hours.

## WhatsApp Business — Categories

**GET /business-categories** — List available categories.

**POST /assign-business-category** `{ categoryId }` — Assign category.

## Partners

**POST /create-instance** `{ name }` — Create a new instance.

**POST /sign-instance** `{ instanceId }` — Sign/activate an instance.

**POST /cancel-instance/{instanceId}` — Cancel an instance.

**GET /list-instances** — List all instances.

## Calls

**POST /send-call** `{ phone }` — Initiate a call.
