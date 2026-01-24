# TokenDragContext

## Interface TokenDragContext

```typescript
interface TokenDragContext {
  clonedToken: canvas.placeables.Token;
  destination: Omit<
    TokenMovementWaypoint,
    "shape" | "height" | "width" | "action"
  > & Partial<
    Pick<TokenMovementWaypoint, "shape" | "height" | "width" | "action">
  >;
  foundPath: TokenMovementWaypoint[];
  hidden: boolean;
  origin: TokenPosition;
  search: TokenFindMovementPathJob;
  searchId: number;
  searching: boolean;
  searchOptions: TokenFindMovementPathOptions;
  token: canvas.placeables.Token;
  unreachableWaypoints: TokenMovementWaypoint[];
  updating: boolean;
  waypoints: (
    Omit<TokenMovementWaypoint, "shape" | "height" | "width" | "action"> &
    Partial<
      Pick<TokenMovementWaypoint, "shape" | "height" | "width" | "action">
    >
  )[];
}
```

## Properties

- **clonedToken**: [canvas.placeables.Token](https://foundryvtt.com/api/modules/foundry.canvas.placeables.html#Token)

- **destination**:  
  `Omit<TokenMovementWaypoint, "shape" | "height" | "width" | "action"> & Partial<Pick<TokenMovementWaypoint, "shape" | "height" | "width" | "action">>`  
  ([TokenMovementWaypoint](https://foundryvtt.com/api/types/foundry.documents.types.TokenMovementWaypoint.html))

- **foundPath**: [TokenMovementWaypoint[]](https://foundryvtt.com/api/types/foundry.documents.types.TokenMovementWaypoint.html)

- **hidden**: `boolean`

- **origin**: [TokenPosition](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenPosition.html)

- **search**: [TokenFindMovementPathJob](https://foundryvtt.com/api/interfaces/foundry.types.TokenFindMovementPathJob.html)

- **searchId**: `number`

- **searching**: `boolean`

- **searchOptions**: [TokenFindMovementPathOptions](https://foundryvtt.com/api/interfaces/foundry.types.TokenFindMovementPathOptions.html)

- **token**: [canvas.placeables.Token](https://foundryvtt.com/api/modules/foundry.canvas.placeables.html#Token)

- **unreachableWaypoints**: [TokenMovementWaypoint[]](https://foundryvtt.com/api/types/foundry.documents.types.TokenMovementWaypoint.html)

- **updating**: `boolean`

- **waypoints**:  
  `(`  
  `Omit<TokenMovementWaypoint, "shape" | "height" | "width" | "action"> & Partial<Pick<TokenMovementWaypoint, "shape" | "height" | "width" | "action">>`  
  `)[]`  
  ([TokenMovementWaypoint](https://foundryvtt.com/api/types/foundry.documents.types.TokenMovementWaypoint.html))