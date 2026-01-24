# pauseGame | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
pauseGame(
    paused: boolean,
    options: { broadcast?: boolean; userId?: string },
): void
```

A hook event that fires when the game is paused or un-paused.

### Parameters

- **paused**: `boolean`  
  Is the game now paused (`true`) or un-paused (`false`)

- **options**: `{ broadcast?: boolean; userId?: string }`  
  Options which modify the pause game request

  - **broadcast**? `boolean` (Optional)  
    Was the pause request broadcast to other clients?

  - **userId**? `string` (Optional)  
    The ID of the User who initiated the pause request

### Returns

`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)