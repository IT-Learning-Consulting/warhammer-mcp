# ClipboardHelper | Foundry Virtual Tabletop - API Documentation - Version 13

A singleton helper class to manage requesting clipboard permissions. Provides common functionality for working with the clipboard.

**See**

[foundry.Game#clipboard](https://foundryvtt.com/api/classes/foundry.Game.html#clipboard)

## Methods

### copyPlainText

```typescript
copyPlainText(text: string): Promise<void>
```

Copies plain text to the clipboard in a cross-browser compatible way.

**Parameters**

- **text**: `string`  
  The text to copy.

**Returns**  
`Promise<void>`