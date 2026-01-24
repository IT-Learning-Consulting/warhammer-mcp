# LimitedAnglePolygon | Foundry Virtual Tabletop - API Documentation - Version 13

A special class of Polygon which implements a limited angle of emission for a Point Source.  
The shape is defined by a point origin, radius, angle, and rotation. The shape is further  
customized by a configurable density which informs the approximation. An optional  
secondary `externalRadius` can be provided which adds supplementary visibility outside the  
primary angle.

## Hierarchy

* _Polygon_
* **LimitedAnglePolygon**

---

## Properties

### aMax

**aMax**: *number*  
The angle of the right (clockwise) edge of the emitted cone in radians.

### aMin

**aMin**: *number*  
The angle of the left (counter-clockwise) edge of the emitted cone in radians.

### angle

**angle**: *number*  
The angle of the Polygon in degrees.

### density

**density**: *number*  
The density of rays which approximate the cone, defined as rays per PI.

### externalBounds

**externalBounds**: *Rectangle*  
The bounding box of the circle defined by the externalRadius, if any.

### externalRadius

**externalRadius**: *number*  
An optional "external radius" which is included in the polygon for the supplementary area outside the cone.

### origin

**origin**: *Point*  
The origin point of the Polygon.

### radius

**radius**: *number*  
The radius of the emitted cone.

### rotation

**rotation**: *number*  
The direction of rotation at the center of the emitted angle in degrees.

---

## Methods

### pointBetweenRays

```typescript
static pointBetweenRays(
    point: Point,
    rMin: PolygonRay,
    rMax: PolygonRay,
    angle: number,
): boolean
```

Test whether a vertex lies between two boundary rays. If the angle is greater than 180, test  
for points between `rMax` and `rMin` (inverse). Otherwise, keep vertices that are between the  
rays directly.

#### Parameters

- **point**: *Point*  
  The candidate point

- **rMin**: *PolygonRay*  
  The counter-clockwise bounding ray

- **rMax**: *PolygonRay*  
  The clockwise bounding ray

- **angle**: *number*  
  The angle being tested, in degrees

#### Returns

*boolean*  
Is the vertex between the two rays?

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)