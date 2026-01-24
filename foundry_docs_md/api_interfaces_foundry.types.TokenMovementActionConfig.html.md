# TokenMovementActionConfig

**Foundry Virtual Tabletop - API Documentation - Version 13**

## Interface TokenMovementActionConfig

```typescript
interface TokenMovementActionConfig {
    canSelect: (token: PrototypeToken | TokenDocument) => boolean;
    deriveTerrainDifficulty:
        | null
        | (nonDerivedDifficulties: { [action: string]: number }) => number;
    getAnimationOptions: (
        token: canvas.placeables.Token,
    ) => Pick<
        TokenAnimationOptions,
        "duration" | "movementSpeed" | "easing" | "ontick"
    >;
    getCostFunction: (
        token: TokenDocument,
        options: TokenMeasureMovementPathOptions,
    ) => TokenMovementActionCostFunction;
    icon: string;
    label: string;
    measure: boolean;
    order: number;
    teleport: boolean;
    visualize: boolean;
    walls: null | string;
}
```

---

## Properties

### canSelect

```typescript
canSelect: (token: PrototypeToken | TokenDocument) => boolean;
```

Can the current User select this movement action for the given Token?  
If selectable, the movement action of the Token can be set to this movement action by the User via the UI and when cycling.  
**Default:** `() => true`

### deriveTerrainDifficulty

```typescript
deriveTerrainDifficulty:
    | null
    | (nonDerivedDifficulties: { [action: string]: number }) => number;
```

If set, this function is used to derive the terrain difficulty from non-derived difficulties, which are those that do not have `deriveTerrainDifficulty` set.  
Used by [foundry.data.regionBehaviors.ModifyMovementCostRegionBehaviorType](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.ModifyMovementCostRegionBehaviorType.html).  
Derived terrain difficulties are not configurable via the behavior UI.

### getAnimationOptions

```typescript
getAnimationOptions: (
    token: canvas.placeables.Token,
) => Pick<
    TokenAnimationOptions,
    "duration" | "movementSpeed" | "easing" | "ontick"
>;
```

Get the default animation options for this movement action.  
**Default:** `() => ({})`

### getCostFunction

```typescript
getCostFunction: (
    token: TokenDocument,
    options: TokenMeasureMovementPathOptions,
) => TokenMovementActionCostFunction;
```

The cost modification function.  
**Default:** `() => cost => cost`

### icon

```typescript
icon: string;
```

The icon of the movement action.

### label

```typescript
label: string;
```

The label of the movement action.

### measure

```typescript
measure: boolean;
```

Is the movement measured? The distance, cost, spaces, and diagonals of a segment that is not measured are always 0.  
**Default:** `true`

### order

```typescript
order: number;
```

The number that is used to sort the movement actions / movement action configs.  
Determines the order in the Token Config/HUD and of cycling.  
**Default:** `0`

### teleport

```typescript
teleport: boolean;
```

Is teleportation? If true, the movement does not go through all grid spaces between the origin and destination: it goes from the origin immediately to the destination grid space.  
**Default:** `false`

### visualize

```typescript
visualize: boolean;
```

Is segment of the movement visualized by the ruler?  
**Default:** `true`

### walls

```typescript
walls: null | string;
```

The type of walls that block this movement, if any.  
**Default:** `"move"`