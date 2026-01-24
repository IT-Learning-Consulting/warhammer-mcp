# WeilerAthertonClipper | Foundry Virtual Tabletop - API Documentation - Version 13

An implementation of the Weiler Atherton algorithm for clipping polygons. This currently only handles combinations that will not result in any holes. Support may be added for holes in the future.

This algorithm is faster than the Clipper library for this task because it relies on the unique properties of the circle, ellipse, or convex simple clip object. It is also more precise in that it uses the actual intersection points between the circle/ellipse and polygon, instead of relying on the polygon approximation of the circle/ellipse to find the intersection points.

For more explanation of the underlying algorithm, see:

- [Weiler–Atherton clipping algorithm - Wikipedia](https://en.wikipedia.org/wiki/Weiler%E2%80%93Atherton_clipping_algorithm)
- [Weiler-Atherton Polygon Clipping Algorithm - GeeksforGeeks](https://www.geeksforgeeks.org/weiler-atherton-polygon-clipping-algorithm)
- [Weiler-Atherton Polygon Clipping Algorithm - H-educate](https://h-educate.in/weiler-atherton-polygon-clipping-algorithm/)

---

## Constructor

```typescript
new WeilerAthertonClipper(
  polygon: Polygon,
  clipObject: Rectangle | Circle,
  clipType: number,
  clipOpts: object,
): WeilerAthertonClipper
```

Construct a WeilerAthertonClipper instance used to perform the calculation.

### Parameters

- **polygon**: `Polygon`  
  Polygon to clip
- **clipObject**: `Rectangle | Circle`  
  Object used to clip the polygon
- **clipType**: `number`  
  Type of clip to use
- **clipOpts**: `object`  
  Object passed to the clippingObject methods `toPolygon` and `pointsBetween`

### Returns

- `WeilerAthertonClipper`

---

## Properties

### clipObject

- Type: `Rectangle | Circle`

### config

- Type: `object`  
  Configuration settings

  - **config.clipType**  
    One of `CLIP_TYPES`
  - **config.clipOpts**  
    Object passed to the clippingObject methods `toPolygon` and `pointsBetween`

### polygon

- Type: `Polygon`

---

## Static Properties

### CLIP_TYPES

```typescript
readonly CLIP_TYPES: {
  INTERSECT: 0;
  UNION: 1;
}
```

The supported clip types. Values are equivalent to those in `ClipperLib.ClipType`.

### INTERSECTION_TYPES

```typescript
readonly INTERSECTION_TYPES: {
  IN_OUT: 1;
  OUT_IN: -1;
  TANGENT: 0;
}
```

The supported intersection types.

---

## Static Methods

### combine

```typescript
combine(
  polygon: Polygon,
  clipObject: Rectangle | Circle,
  options?: { canMutate?: boolean; clipType: number },
): Polygon[]
```

Clip a given clipObject using the Weiler-Atherton algorithm.

At the moment, this will return a single `PIXI.Polygon` in the array unless `clipType` is a union and the polygon and clipObject do not overlap, in which case the `[polygon, clipObject.toPolygon()]` array will be returned. If this algorithm is expanded in the future to handle holes, an array of polygons may be returned.

#### Parameters

- **polygon**: `Polygon`  
  Polygon to clip
- **clipObject**: `Rectangle | Circle`  
  Object to clip against the polygon
- **options** (optional): `{ canMutate?: boolean; clipType: number } = {}`  
  Options which configure how the union or intersection is computed

  - **canMutate**?: `boolean`  
    If the `WeilerAthertonClipper` constructor can mutate the subject polygon points
  - **clipType**: `number`  
    One of [`foundry.canvas.geometry.WeilerAthertonClipper.CLIP_TYPES`](#clip_types)

Any additional properties in `options` (besides `clipType` and `canMutate`) are captured by the rest operator (`...clipOpts`) and passed to the `WeilerAthertonClipper` constructor.

#### Returns

- `Polygon[]`  
  Array of polygons and clipObjects

---

### intersect

```typescript
intersect(
  polygon: Polygon,
  clipObject: Rectangle | Circle,
  clipOpts?: object,
): Polygon[]
```

Intersect a polygon and clipObject using the Weiler Atherton algorithm.

#### Parameters

- **polygon**: `Polygon`  
  Polygon to clip
- **clipObject**: `Rectangle | Circle`  
  Object to clip against the polygon
- **clipOpts** (optional): `object = {}`  
  Options passed to the clipping object methods `toPolygon` and `pointsBetween`

#### Returns

- `Polygon[]`

---

### testForEnvelopment

```typescript
testForEnvelopment(
  polygon: Polygon,
  clipObject: Rectangle | Circle,
  clipType: Readonly<{ INTERSECT: 0; UNION: 1 }>,
  clipOpts: object,
): Polygon[]
```

Test if one shape envelops the other. Assumes the shapes do not intersect.

1. Polygon is contained within the clip object.  
   - Union: clip object  
   - Intersect: polygon
2. Clip object is contained within polygon.  
   - Union: polygon  
   - Intersect: clip object
3. Polygon and clip object are outside one another.  
   - Union: both  
   - Intersect: null

#### Parameters

- **polygon**: `Polygon`  
  Polygon to clip
- **clipObject**: `Rectangle | Circle`  
  Object to clip against the polygon
- **clipType**: `Readonly<{ INTERSECT: 0; UNION: 1 }>`  
  One of `CLIP_TYPES`
- **clipOpts**: `object`  
  Clip options forwarded to `toPolygon` methods

#### Returns

- `Polygon[]`  
  Returns the polygon, the `clipObject.toPolygon()`, both, or neither.

---

### union

```typescript
union(
  polygon: Polygon,
  clipObject: Rectangle | Circle,
  clipOpts?: object,
): Polygon[]
```

Union a polygon and clipObject using the Weiler Atherton algorithm.

#### Parameters

- **polygon**: `Polygon`  
  Polygon to clip
- **clipObject**: `Rectangle | Circle`  
  Object to clip against the polygon
- **clipOpts** (optional): `object = {}`  
  Options passed to the clipping object methods `toPolygon` and `pointsBetween`

#### Returns

- `Polygon[]`