# ChatBubbles | Foundry Virtual Tabletop - API Documentation - Version 13

The Chat Bubble Class  
This application displays a temporary message sent from a particular Token in the active Scene. The message is displayed on the HUD layer just above the Token.

---

## Properties

### bubbles

```typescript
bubbles: object = {}
```
Track active Chat Bubbles

### template

```typescript
template: string = "templates/hud/chat-bubble.html"
```
The Handlebars template used to render Chat Bubbles.

---

## Accessors

### element

```typescript
get element(): HTMLElement
```
A reference to the chat bubbles HTML container in which rendered bubbles should live

**Returns:** `HTMLElement`

---

## Methods

### broadcast

```typescript
broadcast(
    token: TokenDocument,
    message: string,
    options?: ChatBubbleOptions,
): Promise<null | HTMLElement>
```

Create a chat bubble message for a certain token which is synchronized for display across all connected clients.

**Parameters:**

- **token**: `TokenDocument`  
  The speaking Token Document
- **message**: `string`  
  The spoken message text
- **options**: `ChatBubbleOptions` (optional, default: `{}`)  
  Options which affect the bubble appearance

**Returns:** `Promise<null | HTMLElement>`  
A promise which resolves with the created bubble HTML, or null

---

### say

```typescript
say(
    token: Token,
    message: string,
    options?: ChatBubbleOptions,
): Promise<null | HTMLElement>
```

Speak a message as a particular Token, displaying it as a chat bubble

**Parameters:**

- **token**: `Token`  
  The speaking Token
- **message**: `string`  
  The spoken message text
- **options**: `ChatBubbleOptions` (optional, default: `{}`)  
  Options which affect the bubble appearance

**Returns:** `Promise<null | HTMLElement>`  
A Promise which resolves to the created bubble HTML element, or null

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)