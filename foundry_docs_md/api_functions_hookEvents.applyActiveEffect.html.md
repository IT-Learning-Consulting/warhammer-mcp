# applyActiveEffect | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `applyActiveEffect`

```typescript
applyActiveEffect(
    actor: documents.Actor,
    change: EffectChangeData,
    current: any,
    delta: any,
    changes: object,
): void
```

A hook event that fires when a custom active effect is applied.

**Parameters**

- **actor**: `documents.Actor`  
  The actor the active effect is being applied to

- **change**: `EffectChangeData`  
  The change data being applied

- **current**: `any`  
  The current value being modified

- **delta**: `any`  
  The parsed value of the change object

- **changes**: `object`  
  An object which accumulates changes to be applied

**Returns**  
`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)