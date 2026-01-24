# TokenMovementSegmentData | Foundry Virtual Tabletop - API Documentation - Version 13

**Type Alias** `TokenMovementSegmentData`

```typescript
type TokenMovementSegmentData = Pick<
    TokenMeasuredMovementWaypoint,
    "width"
    | "height"
    | "shape"
    | "action"
    | "terrain",
> & {
    actionConfig: TokenMovementActionConfig;
    teleport: boolean;
};
```

- **`width`**, **`height`**, **`shape`**, **`action`**, **`terrain`**: Properties picked from [`TokenMeasuredMovementWaypoint`](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenMeasuredMovementWaypoint.html)
- **`actionConfig`**: [`TokenMovementActionConfig`](https://foundryvtt.com/api/interfaces/foundry.types.TokenMovementActionConfig.html)
- **`teleport`**: `boolean`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)