# HTMLSecretBlockElement | Foundry Virtual Tabletop - API Documentation - Version 13

A custom HTML element used to wrap secret blocks in HTML content in order to provide additional interactivity.

## Hierarchy

- *HTMLElement*
- **HTMLSecretBlockElement**

## Static Properties

### `tagName`

```typescript
tagName: string = "secret-block"
```

The HTML tag name used by this element.

## Accessors

### `revealed`

```typescript
get revealed(): boolean
```

The revealed state of the secret block.

**Returns:** `boolean`

### `secret`

```typescript
get secret(): HTMLElement
```

The wrapped secret block.

**Returns:** `HTMLElement`

## Methods

### `connectedCallback`

```typescript
connectedCallback(): void
```

**Returns:** `void`

### `toggleRevealed`

```typescript
toggleRevealed(content: string): string
```

Toggle the secret revealed or hidden state in content that this secret block represents.

**Parameters:**

- **content**: `string`  
  The raw string content for this secret.

**Returns:** `string`  
The modified raw content.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)