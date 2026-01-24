# HTMLSecret | Foundry Virtual Tabletop - API Documentation - Version 13

A composable class for managing functionality for secret blocks within DocumentSheets.

**See**  
[foundry.applications.api.DocumentSheet](https://foundryvtt.com/api/classes/foundry.applications.api.DocumentSheetV2.html)

**Example: Activate secret revealing functionality within a certain block of content.**

```typescript
const secrets = new HTMLSecret({
  selector: "section.secret[id]",
  callbacks: {
    content: this._getSecretContent.bind(this),
    update: this._updateSecret.bind(this)
  }
});
secrets.bind(html);
```

## Constructors

### constructor

```typescript
new HTMLSecret(config?: HTMLSecretConfiguration): HTMLSecret
```

**Parameters**

- **config**: `HTMLSecretConfiguration` = `{}`

## Methods

### bind

```typescript
bind(html: HTMLElement): void
```

Add event listeners to the targeted secret blocks.

**Parameters**

- **html**: `HTMLElement`  
  The HTML content to select secret blocks from.

**Returns**  
`void`

### _onToggleSecret

```typescript
_onToggleSecret(event: MouseEvent): void | Promise<ClientDocument>
```

Handle toggling a secret's revealed state.

**Parameters**

- **event**: `MouseEvent`  
  The triggering click event.

**Returns**  
`void` | `Promise<ClientDocument>`  
The Document whose content was modified.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)