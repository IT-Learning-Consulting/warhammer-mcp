# chatInput | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `chatInput`

```typescript
chatInput(
    event: KeyboardEvent,
    options: { recordPending: boolean },
): boolean | void
```

A hook event that fires during handling of user chat input.

**Parameters**

- **event**: `KeyboardEvent`  
  The triggering event.

- **options**: `{ recordPending: boolean }`  
  Additional options to configure handling of chat input if default behavior is suppressed.

  - **recordPending**: `boolean`  
    Record the user's keystroke as pending. If the hook returns false and otherwise prevents the keystroke appearing in the chat input, this option should also be set to false in order to prevent chat history from becoming out-of-sync.

**Returns** `boolean` | `void`  
Returning false will prevent default chat input behavior.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)