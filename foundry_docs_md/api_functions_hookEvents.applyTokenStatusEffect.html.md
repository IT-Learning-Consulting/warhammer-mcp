# applyTokenStatusEffect | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
applyTokenStatusEffect(
    token: canvas.placeables.Token,
    statusId: string,
    active: boolean,
): void
```

A hook event that fires when a token [`foundry.canvas.placeables.Token`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html) should apply a specific status effect.

### Parameters

- **token**: `canvas.placeables.Token`  
  The token affected.

- **statusId**: `string`  
  The status effect ID being applied, from `CONFIG.specialStatusEffects`.

- **active**: `boolean`  
  Is the special status effect now active?

### Returns

- `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)