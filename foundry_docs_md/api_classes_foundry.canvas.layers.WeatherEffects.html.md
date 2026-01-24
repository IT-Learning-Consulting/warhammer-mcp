# WeatherEffects

A CanvasLayer for displaying visual effects like weather, transitions, flashes, or more.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [canvas](https://foundryvtt.com/api/modules/foundry.canvas.html) / [layers](https://foundryvtt.com/api/modules/foundry.canvas.layers.html) /  
[WeatherEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.WeatherEffects.html)

## Hierarchy

- any
- **WeatherEffects**

## Properties

### effects

- **Type:** `Map<string, any[]>`  
- **Description:** Array of weather effects linked to this weather container.

### occlusionFilter

- **Type:** [WeatherOcclusionMaskFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.WeatherOcclusionMaskFilter.html)  
- **Description:** The inverse occlusion mask filter bound to this container.

### occlusionMaskConfig

- **Type:** [WeatherOcclusionMaskConfiguration](https://foundryvtt.com/api/interfaces/foundry.WeatherOcclusionMaskConfiguration.html)  
- **Description:**  
  A default configuration of the terrain mask that is automatically applied to any shader-based  
  weather effects. This configuration is automatically passed to  
  `WeatherShaderEffect#configureTerrainMask` upon construction.

### suppression

- **Type:** `Container<DisplayObject>`  
- **Description:** The container in which suppression meshed are added.

### terrainMaskConfig

- **Type:** [WeatherTerrainMaskConfiguration](https://foundryvtt.com/api/interfaces/foundry.WeatherTerrainMaskConfiguration.html)  
- **Description:**  
  A default configuration of the terrain mask that is automatically applied to any shader-based  
  weather effects. This configuration is automatically passed to  
  `WeatherShaderEffect#configureTerrainMask` upon construction.

## Accessors

### weatherEffects

- **Type:** `Container<DisplayObject>`  
- **Description:** The container in which effects are added.

### elevation

```typescript
get elevation(): number
```

- **Description:** The elevation of this object.
- **Returns:** `number`
- **Default:** `Infinity`

### sort

```typescript
get sort(): number
```

- **Description:** A key which resolves ties amongst objects at the same elevation within the same layer.
- **Returns:** `number`
- **Default:** `0`

### sortLayer

```typescript
get sortLayer(): number
```

- **Description:** A key which resolves ties amongst objects at the same elevation of different layers.
- **Returns:** `number`
- **Default:** `PrimaryCanvasGroup.SORT_LAYERS.WEATHER`

### zIndex

```typescript
get zIndex(): number
```

- **Description:**  
  A key which resolves ties amongst objects at the same elevation within the same layer and same sort.
- **Returns:** `number`
- **Default:** `0`

### layerOptions

```typescript
static get layerOptions(): object
```

- **Description:**  
  Static accessor.
- **Returns:** `object`
- **Inherit Doc**

## Methods

### _draw

```typescript
_draw(options: any): Promise<void>
```

- **Parameters:**  
  - **options**: `any`
- **Returns:** `Promise<void>`
- **Inherit Doc**

### _tearDown

```typescript
_tearDown(options: any): Promise<any>
```

- **Parameters:**  
  - **options**: `any`
- **Returns:** `Promise<any>`
- **Inherit Doc**

### clearEffects

```typescript
clearEffects(): void
```

- **Description:** Clear the weather container.  
- **Returns:** `void`

### initializeEffects

```typescript
initializeEffects(weatherEffectsConfig?: object): void
```

- **Description:** Initialize the weather container from a weather config object.  
- **Parameters:**  
  - **weatherEffectsConfig?**: `object` — Weather config object (or null/undefined to clear the container). Optional.  
- **Returns:** `void`

### configureOcclusionMask

```typescript
protected static configureOcclusionMask(
  context: Shader,
  config?: WeatherOcclusionMaskConfiguration,
): void
```

- **Description:** Set the occlusion uniforms for this weather shader.  
- **Parameters:**  
  - **context**: `Shader` — The shader context  
  - **config?**: [WeatherOcclusionMaskConfiguration](https://foundryvtt.com/api/interfaces/foundry.WeatherOcclusionMaskConfiguration.html) = `{}` — Occlusion masking options  
- **Returns:** `void`

### configureTerrainMask

```typescript
protected static configureTerrainMask(
  context: Shader,
  config?: WeatherTerrainMaskConfiguration,
): void
```

- **Description:** Set the terrain uniforms for this weather shader.  
- **Parameters:**  
  - **context**: `Shader` — The shader context  
  - **config?**: [WeatherTerrainMaskConfiguration](https://foundryvtt.com/api/interfaces/foundry.WeatherTerrainMaskConfiguration.html) = `{}` — Terrain masking options  
- **Returns:** `void`