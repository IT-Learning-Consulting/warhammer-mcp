# EffectsCanvasGroup | Foundry Virtual Tabletop - API Documentation - Version 13

A container group which contains visual effects rendered above the primary group.

TODO: The effects canvas group is now only performing shape initialization, logic that needs  
to happen at the placeable or object level is now their burden.

[DONE] Adding or removing a source from the EffectsCanvasGroup collection.  
[TODO] A change in a darkness source should re-initialize all overlapping light and vision  
source.

## Hook Events

- [hookEvents.lightingRefresh](https://foundryvtt.com/api/functions/hookEvents.lightingRefresh.html)

## Hierarchy

*any*

## Properties

### animateLightSources

`animateLightSources: boolean = true`

Whether to currently animate light sources.

### animateVisionSources

`animateVisionSources: boolean = true`

Whether to currently animate vision sources.

### background

`background: undefined | [CanvasBackgroundAlterationEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasBackgroundAlterationEffects.html)`

A layer of background alteration effects which change the appearance of the primary group  
render texture.

### coloration

`coloration: undefined | [CanvasColorationEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasColorationEffects.html)`

A layer which adds color-based effects to the scene.

### darkness

`darkness: undefined | [CanvasDarknessEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasDarknessEffects.html)`

A layer which adds darkness effects to the scene.

### darknessSources

`darknessSources: any = ...`

A mapping of darkness sources which are active within the rendered Scene.

### illumination

`illumination: undefined | [CanvasIlluminationEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.CanvasIlluminationEffects.html)`

A layer which adds illumination-based effects to the scene.

### lightSources

`lightSources: any = ...`

A mapping of light sources which are active within the rendered Scene.

### visionSources

`visionSources: any = ...`

A Collection of vision sources which are currently active within the rendered Scene.

### visualEffectsMaskingFilters

`visualEffectsMaskingFilters: Set<VisualEffectsMaskingFilter> = ...`

A set of vision mask filters used in visual effects group.

## Methods

### _createLayers

```typescript
_createLayers(): {
    background: undefined | CanvasBackgroundAlterationEffects;
    coloration: undefined | CanvasColorationEffects;
    darkness: undefined | CanvasDarknessEffects;
    illumination: undefined | CanvasIlluminationEffects;
}
```

**Returns**  
An object containing layers:

- **background**: `undefined | CanvasBackgroundAlterationEffects`
- **coloration**: `undefined | CanvasColorationEffects`
- **darkness**: `undefined | CanvasDarknessEffects`
- **illumination**: `undefined | CanvasIlluminationEffects`

### _draw

```typescript
_draw(options: any): Promise<void>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<void>`

### _tearDown

```typescript
_tearDown(options: any): Promise<void>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<void>`

### activateAnimation

```typescript
activateAnimation(): void
```

Activate light source animation for AmbientLight objects within this layer.

**Returns**  
`void`

### activatePostProcessingFilters

```typescript
activatePostProcessingFilters(
    filterMode: string,
    postProcessingModes?: string[],
    uniforms?: Object,
): void
```

Activate post-processing effects for a certain effects channel.

**Parameters**

- **filterMode**: `string`  
  The filter mode to target.

- **postProcessingModes** (Optional): `string[] = []`  
  The post-processing modes to apply to this filter.

- **uniforms** (Optional): `Object = {}`  
  The uniforms to update.

**Returns**  
`void`

### allSources

```typescript
allSources(): Generator<any, void, void>
```

Iterator for all light and darkness sources.

**Returns**  
`Generator<any, void, void>`

**Yields**

- `PointDarknessSource | PointLightSource`

### animateDarkness

```typescript
animateDarkness(target?: number, duration?: number): Promise<any>
```

Animate a smooth transition of the darkness overlay to a target value. Only begin animating  
if another animation is not already in progress.

**Parameters**

- **target** (Optional): `number = 1.0`  
  The target darkness level between 0 and 1.

- **duration** (Optional): `number`  
  The desired animation time in milliseconds. Default is 10 seconds.

**Returns**  
`Promise<any>`  
A Promise which resolves once the animation is complete.

### clearEffects

```typescript
clearEffects(): void
```

Clear all effects containers and animated sources.

**Returns**  
`void`

### deactivateAnimation

```typescript
deactivateAnimation(): void
```

Deactivate light source animation for AmbientLight objects within this layer.

**Returns**  
`void`

### getDarknessLevel

```typescript
getDarknessLevel(point: ElevatedPoint, _elevation: any): number
```

Get the darkness level at the given point.

**Parameters**

- **point**: [ElevatedPoint](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)  
  The point.

- **_elevation**: `any`

**Returns**  
`number`  
The darkness level.

### initializeLightSources

```typescript
initializeLightSources(): void
```

Initialize positive light sources which exist within the active Scene. Packages can use the  
"initializeLightSources" hook to programmatically add light sources.

**Returns**  
`void`

### initializePriorityLightSources

```typescript
initializePriorityLightSources(): void
```

Initialize all sources that generate edges (Darkness and certain Light sources). Darkness  
sources always generate edges. Light sources only do so if their priority is strictly greater  
than 0. The `edgesSources` array will be rebuilt and sorted by descending priority, in the case  
of a tie, DarknessSources take precedence. Otherwise, the existing array is used as-is.  
Regardless of whether the array is rebuilt, each source is re-initialized to ensure their  
geometry is refreshed.

**Returns**  
`void`

### refreshLighting

```typescript
refreshLighting(): void
```

Refresh the active display of lighting.

**Returns**  
`void`

### refreshLightSources

```typescript
refreshLightSources(): void
```

Refresh the state and uniforms of all light sources and darkness sources objects.

**Returns**  
`void`

### refreshVisionSources

```typescript
refreshVisionSources(): void
```

Refresh the state and uniforms of all VisionSource objects.

**Returns**  
`void`

### resetPostProcessingFilters

```typescript
resetPostProcessingFilters(): void
```

Reset post-processing modes on all Visual Effects masking filters.

**Returns**  
`void`

### testInsideDarkness

```typescript
testInsideDarkness(
    point: ElevatedPoint,
    options?: { condition?: (source: PointDarknessSource) => boolean },
): boolean
```

Test whether the point is inside darkness.

**Parameters**

- **point**: [ElevatedPoint](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)  
  The point to test.

- **options** (Optional): `{ condition?: (source: PointDarknessSource) => boolean } = {}`

  - **condition** (Optional): `(source: PointDarknessSource) => boolean`  
    Optional condition a source must satisfy in order to be tested.

**Returns**  
`boolean`  
Is inside darkness?

### testInsideLight

```typescript
testInsideLight(
    point: ElevatedPoint,
    options?: { condition?: (source: PointLightSource) => boolean },
): boolean
```

Test whether the point is inside light.

**Parameters**

- **point**: [ElevatedPoint](https://foundryvtt.com/api/interfaces/foundry.types.ElevatedPoint.html)  
  The point to test.

- **options** (Optional): `{ condition?: (source: PointLightSource) => boolean } = {}`

  - **condition** (Optional): `(source: PointLightSource) => boolean`  
    Optional condition a source must satisfy in order to be tested.

**Returns**  
`boolean`  
Is inside light?

### toggleMaskingFilters

```typescript
toggleMaskingFilters(enabled?: boolean): void
```

Activate vision masking for visual effects.

**Parameters**

- **enabled** (Optional): `boolean = true`  
  Whether to enable or disable vision masking.

**Returns**  
`void`