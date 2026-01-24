# PrototypeTokenData | Foundry Virtual Tabletop - API Documentation - Version 13

## Type Alias PrototypeTokenData

```typescript
type PrototypeTokenData = Omit<
    TokenData,
    | "_id"
    | "actorId"
    | "delta"
    | "x"
    | "y"
    | "elevation"
    | "shape"
    | "sort"
    | "hidden"
    | "locked"
    | "_movementHistory"
    | "_regions"
>;
```

- **PrototypeTokenData** is a type alias that omits the following properties from the `TokenData` interface:
  - `_id`
  - `actorId`
  - `delta`
  - `x`
  - `y`
  - `elevation`
  - `shape`
  - `sort`
  - `hidden`
  - `locked`
  - `_movementHistory`
  - `_regions`

Refer to the original `TokenData` interface for full details: [TokenData](https://foundryvtt.com/api/interfaces/foundry.documents.types.TokenData.html).

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)