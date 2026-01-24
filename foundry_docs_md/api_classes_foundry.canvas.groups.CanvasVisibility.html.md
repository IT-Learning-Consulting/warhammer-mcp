# CanvasVisibility | Foundry Virtual Tabletop - API Documentation - Version 13

**Class CanvasVisibility**  
The visibility group which implements dynamic vision, lighting, and fog of war. This group uses an event-driven workflow to perform the minimal required calculation in response to changes.

## Hook Events

- [hookEvents.initializeVisionMode](https://foundryvtt.com/api/functions/hookEvents.initializeVisionMode.html)  
- [hookEvents.initializeVisionSources](https://foundryvtt.com/api/functions/hookEvents.initializeVisionSources.html)  
- [hookEvents.sightRefresh](https://foundryvtt.com/api/functions/hookEvents.sightRefresh.html)  
- [hookEvents.visibilityRefresh](https://foundryvtt.com/api/functions/hookEvents.visibilityRefresh.html)  

## Hierarchy

`any`  
**CanvasVisibility**

---

# Properties

### explored

- **Type:** `Container<DisplayObject>`  
The exploration container which tracks exploration progress.

### lightingVisibility

- **Type:**  
  ```typescript
  {
    any: boolean;
    background: number;
    coloration: number;
    darkness: number;
    illumination: number;
  }
  ```
Define whether each lighting layer is enabled, required, or disabled by this vision mode.  
The value for each lighting channel is a number in `LIGHTING_VISIBILITY`.

### visibilityOverlay

- **Type:** `Sprite`  
The optional visibility overlay sprite that should be drawn instead of the unexplored color in the fog of war.

### vision

- **Type:** `CanvasVisionContainer`  
The currently revealed vision.

### visionModeData

- **Type:**  
  ```typescript
  {
    activeLightingOptions: object;
    source: null | [PointVisionSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointVisionSource.html);
  }
  ```
The active vision source data object.

### groupName  *(Static)*

- **Type:** `string = "visibility"`  

---

# Accessors

### explorationRect

```typescript
set explorationRect(rect: any): void
```

Optional overrides for exploration sprite dimensions.

- **Parameters:**
  - **rect:** `any`
- **Returns:** `void`

### initialized

```typescript
get initialized(): boolean
```

A status flag for whether the group initialization workflow has succeeded.

- **Returns:** `boolean`

### textureConfiguration

```typescript
get textureConfiguration(): CanvasVisibilityTextureConfiguration
```

The configured options used for the saved fog-of-war texture.  
See [CanvasVisibilityTextureConfiguration](https://foundryvtt.com/api/interfaces/foundry.types.CanvasVisibilityTextureConfiguration.html).

- **Returns:** `CanvasVisibilityTextureConfiguration`

### tokenVision

```typescript
get tokenVision(): boolean
```

Does the currently viewed Scene support Token field of vision?

- **Returns:** `boolean`

---

# Methods

### _draw

```typescript
_draw(options: any): Promise<void>
```

- **Parameters:**
  - **options:** `any`
- **Returns:** `Promise<void>`

### _tearDown

```typescript
_tearDown(options: any): Promise<any>
```

- **Parameters:**
  - **options:** `any`
- **Returns:** `Promise<any>`

### initializeSources

```typescript
initializeSources(): void
```

Initialize all Token vision sources which are present on this group.

- **Returns:** `void`

### initializeVisionMode

```typescript
initializeVisionMode(): void
```

Initialize the vision mode.

- **Returns:** `void`

### refresh

```typescript
refresh(): void
```

Update the display of the visibility group. Organize sources into rendering queues and draw lighting containers for each source.

- **Returns:** `void`

### refreshVisibility

```typescript
refreshVisibility(): void
```

Update vision (and fog if necessary).

- **Returns:** `void`

### resetExploration

```typescript
resetExploration(): void
```

Reset the exploration container with the fog sprite.

- **Returns:** `void`

### restrictVisibility

```typescript
restrictVisibility(): void
```

Restrict the visibility of certain canvas assets (like Tokens or DoorControls) based on the visibility polygon. These assets should only be displayed if they are visible given the current player's field of view.

- **Returns:** `void`

### testVisibility

```typescript
testVisibility(
  point: Point | ElevatedPoint,
  options?: { object?: null | object; tolerance?: number },
): boolean
```

Test whether a target point on the Canvas is visible based on the current vision and LOS polygons.

- **Parameters:**
  - **point:** `Point` | `ElevatedPoint`  
    The point in space to test.
  - **options:** (optional)
    - **object?:** `null | object`  
      An optional reference to the object whose visibility is being tested.
    - **tolerance?:** `number`  
      A numeric radial offset which allows for a non-exact match. For example, if tolerance is 2 then the test will pass if the point is within 2px of a vision polygon.

- **Returns:** `boolean`  
Whether the point is currently visible.