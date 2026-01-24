# chatBubbleHTML | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `chatBubbleHTML`

```typescript
chatBubbleHTML(
    token: canvas.placeables.Token, 
    html: HTMLElement, 
    message: string, 
    options: ChatBubbleOptions
): boolean | void
```

A hook event that fires when a chat bubble is initially configured.

**Parameters**

- **token**: `canvas.placeables.Token`  
  The speaking token.

- **html**: `HTMLElement`  
  The HTML of the chat bubble.

- **message**: `string`  
  The spoken message text.

- **options**: [`ChatBubbleOptions`](https://foundryvtt.com/api/interfaces/foundry.ChatBubbleOptions.html)  
  Provided options which affect bubble appearance.

**Returns**  
`boolean` | `void`  
May return false to prevent the calling workflow.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)