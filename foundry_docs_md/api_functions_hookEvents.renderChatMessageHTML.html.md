# renderChatMessageHTML | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
renderChatMessageHTML(
    message: documents.ChatMessage,
    html: HTMLElement,
    context: object,
): void
```

A hook event that fires for each `ChatMessage` which is rendered for addition to the ChatLog.  
This hook allows for final customization of the message HTML before it is added to the log.

**Parameters**

- **message**: `documents.ChatMessage`  
  The ChatMessage document being rendered.

- **html**: `HTMLElement`  
  The pending HTML.

- **context**: `object`  
  The rendering context.

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)