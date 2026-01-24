# TokenConstrainMovementPathOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TokenConstrainMovementPathOptions {
    history?: boolean | readonly DeepReadonly<TokenMeasuredMovementWaypoint>[];
    ignoreCost?: boolean;
    ignoreWalls?: boolean;
    preview?: boolean;
}
```

## Properties

### Optional

- **history?**: `boolean | readonly DeepReadonly<TokenMeasuredMovementWaypoint>[]`  
  Consider movement history?  
  If `true`, uses the current movement history. If waypoints are passed, use those as the history.  
  **Default:** `false`.

- **ignoreCost?**: `boolean`  
  Ignore cost?  
  **Default:** `false`.

- **ignoreWalls?**: `boolean`  
  Ignore walls?  
  **Default:** `false`.

- **preview?**: `boolean`  
  Constrain a preview path?  
  **Default:** `false`.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[DeepReadonly](https://foundryvtt.com/api/types/foundry.types.DeepReadonly.html)  
[TokenMeasuredMovementWaypoint](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMeasuredMovementWaypoint.html)