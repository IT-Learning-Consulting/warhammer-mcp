# PointSourcePolygonConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface PointSourcePolygonConfig {
    angle?: number;
    boundaryShapes?: (Rectangle | Polygon | Circle)[];
    boundingBox?: Readonly<Rectangle>;
    debug?: boolean;
    density?: number;
    hasLimitedAngle?: Readonly<boolean>;
    hasLimitedRadius?: Readonly<boolean>;
    radius?: number;
    rotation?: number;
    source?: any;
    type: PointSourcePolygonType;
    useThreshold?: boolean;
    wallDirectionMode?: number;
}
```

## Properties

### angle?  
- **Type:** `number`  
The angle of emission, if limited

### boundaryShapes?  
- **Type:** `(Rectangle | Polygon | Circle)[]`  
Limiting polygon boundary shapes

### boundingBox?  
- **Type:** `Readonly<Rectangle>`  
The computed bounding box for the polygon

### debug?  
- **Type:** `boolean`  
Display debugging visualization and logging for the polygon

### density?  
- **Type:** `number`  
The desired density of padding rays, a number per PI

### hasLimitedAngle?  
- **Type:** `Readonly<boolean>`  
Does this polygon have a limited angle?

### hasLimitedRadius?  
- **Type:** `Readonly<boolean>`  
Does this polygon have a limited radius?

### radius?  
- **Type:** `number`  
A limited radius of the resulting polygon

### rotation?  
- **Type:** `number`  
The direction of facing, required if the angle is limited

### source?  
- **Type:** `any`  
The object (if any) that spawned this polygon.

### type  
- **Type:** [`PointSourcePolygonType`](https://foundryvtt.com/api/types/foundry.canvas.geometry.types.PointSourcePolygonType.html)  
The type of polygon being computed

### useThreshold?  
- **Type:** `boolean`  
Compute the polygon with threshold wall constraints applied

### wallDirectionMode?  
- **Type:** `number`  
Customize how wall direction of one-way walls is applied