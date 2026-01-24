# GridHex | Foundry Virtual Tabletop - API Documentation - Version 13

A helper class which represents a single hexagon as part of a HexagonalGrid. This class relies on having an active canvas scene in order to know the configuration of the hexagonal grid.

## Constructors

### constructor

```typescript
new GridHex(
    coordinates: HexagonalGridCoordinates2D,
    grid: HexagonalGrid,
): GridHex
```

Construct a GridHex instance by providing a hex coordinate.

**Parameters**

- **coordinates**: *HexagonalGridCoordinates2D*  
  The coordinates of the hex to construct
- **grid**: *HexagonalGrid*  
  The hexagonal grid instance to which this hex belongs

## Properties

### cube

- Type: [HexagonalGridCube2D](https://foundryvtt.com/api/interfaces/foundry.grid.types.HexagonalGridCube2D.html)  
  The cube coordinate of this hex

### grid

- Type: [HexagonalGrid](https://foundryvtt.com/api/classes/foundry.grid.HexagonalGrid.html)  
  The hexagonal grid to which this hex belongs.

### offset

- Type: [GridOffset2D](https://foundryvtt.com/api/interfaces/foundry.grid.types.GridOffset2D.html)  
  The offset coordinate of this hex

## Accessors

### center

```typescript
get center(): Point
```

Return a reference to the pixel point in the center of this hexagon.

- Returns: [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)

### topLeft

```typescript
get topLeft(): Point
```

Return a reference to the pixel point of the top-left corner of this hexagon.

- Returns: [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)

## Methods

### equals

```typescript
equals(other: GridHex): boolean
```

Return whether this GridHex equals the same position as some other GridHex instance.

**Parameters**

- **other**: *GridHex*  
  Some other GridHex

**Returns**

- *boolean* — Are the positions equal?

### getNeighbors

```typescript
getNeighbors(): GridHex[]
```

Return the array of hexagons which are neighbors of this one. This result is un-bounded by the confines of the game canvas and may include hexes which are off-canvas.

**Returns**

- *GridHex[]*

### shiftCube

```typescript
shiftCube(dq: number, dr: number, ds: number): GridHex
```

Get a neighboring hex by shifting along cube coordinates

**Parameters**

- **dq**: *number*  
  A number of hexes to shift along the q axis
- **dr**: *number*  
  A number of hexes to shift along the r axis
- **ds**: *number*  
  A number of hexes to shift along the s axis

**Returns**

- *GridHex* — The shifted hex