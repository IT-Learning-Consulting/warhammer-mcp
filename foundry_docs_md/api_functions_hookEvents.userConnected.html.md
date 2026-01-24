# userConnected | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `userConnected`

```typescript
userConnected(user: documents.User, connected: boolean): void
```

A hook event that fires whenever some other User joins or leaves the game session.

**Parameters**

- **user**: `documents.User`  
  The User who has connected or disconnected.
  
- **connected**: `boolean`  
  Is the user now connected (`true`) or disconnected (`false`).

**Returns**: `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)