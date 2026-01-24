# PointVisionSource | Foundry Virtual Tabletop - API Documentation - Version 13

A specialized subclass of `RenderedEffectSource` which represents a source of point-based vision.

## Hierarchy

- any  
- **PointVisionSource**

## Constructors

### constructor

```typescript
new PointVisionSource(options?: BaseEffectSourceOptions): PointVisionSource
```

An effect source is constructed by providing configuration options.

**Parameters**

- **options**: `BaseEffectSourceOptions` = `{}`  
  Options which modify the base effect source instance

**Returns**  
`PointVisionSource`

(Inherited from `PointEffectSourceMixin(RenderedEffectSource).constructor`)

## Properties

### blinded

`blinded: Record<string, boolean> = {}`

Records of blinding strings with a boolean value. By default, if any of this record is true, the source is blinded.

---

### light

`light: PointSourcePolygon`

The polygon of light perception.

---

### los

`los: PointSourcePolygon`

The unconstrained LOS polygon.

---

### visionMode

`visionMode: any = null`

The vision mode linked to this VisionSource.

---

### visionModeOverrides

`visionModeOverrides: object = {}`

Data overrides that could happen with blindness vision mode.

---

### Static Properties

- `_initializeShaderKeys: string[] = ...`
- `_refreshUniformsKeys: string[] = ...`
- `defaultData: any = ...`
- `EDGE_OFFSET: number = -2`
- `effectsCollection: string = "visionSources"`
- `sourceType: string = "sight"`
- `_brightLightingLevel: number = LIGHTING_LEVELS.BRIGHT`  
  The corresponding lighting levels for bright light.
- `_dimLightingLevel: number = LIGHTING_LEVELS.DIM`  
  The corresponding lighting levels for dim light.

## Accessors

### fov

```typescript
get fov(): any
```

An alias for the shape of the vision source.

**Returns**  
`any`

---

### isAnimated

```typescript
get isAnimated(): boolean
```

Is the rendered source animated?

**Returns**  
`boolean`

---

### isBlinded

```typescript
get isBlinded(): boolean
```

Is this source temporarily blinded?

**Returns**  
`boolean`

---

### lightRadius

```typescript
get lightRadius(): number
```

Light perception radius of this vision source, taking into account if the source is blinded.

**Returns**  
`number`

---

### preferred

```typescript
get preferred(): boolean
```

If this vision source background is rendered into the lighting container.

**Returns**  
`boolean`

---

### radius

```typescript
get radius(): any
```

**Returns**  
`any`

---

### _layers

```typescript
get _layers(): {
    background: {
        blendMode: string;
        defaultShader: typeof BackgroundVisionShader;
    };
    coloration: {
        blendMode: string;
        defaultShader: typeof ColorationVisionShader;
    };
    illumination: {
        blendMode: string;
        defaultShader: typeof IlluminationVisionShader;
    };
}
```

**Returns**

```typescript
{
    background: {
        blendMode: string;
        defaultShader: typeof BackgroundVisionShader;
    };
    coloration: {
        blendMode: string;
        defaultShader: typeof ColorationVisionShader;
    };
    illumination: {
        blendMode: string;
        defaultShader: typeof IlluminationVisionShader;
    };
}
```

## Methods

### _configure

```typescript
_configure(changes: any): void
```

**Parameters**

- **changes**: `any`

**Returns**  
`void`

(Inherited method)

---

### _configureLayer

```typescript
_configureLayer(layer: any, layerId: any): void
```

**Parameters**

- **layer**: `any`  
- **layerId**: `any`

**Returns**  
`void`

---

### _configureShaders

```typescript
_configureShaders(): {}
```

**Returns**  
`{}`

---

### _createShapes

```typescript
_createShapes(): void
```

**Returns**  
`void`

(Inherited method)

---

### _getPolygonConfiguration

```typescript
_getPolygonConfiguration(): any
```

**Returns**  
`any`

(Inherited method)

---

### _initialize

```typescript
_initialize(data: any): void
```

**Parameters**

- **data**: `any`

**Returns**  
`void`

(Inherited method)

---

### _updateBackgroundUniforms

```typescript
_updateBackgroundUniforms(): void
```

**Returns**  
`void`

(Inherited method)

---

### _updateColorationUniforms

```typescript
_updateColorationUniforms(): void
```

**Returns**  
`void`

(Inherited method)

---

### _updateCommonUniforms

```typescript
_updateCommonUniforms(shader: any): void
```

**Parameters**

- **shader**: `any`

**Returns**  
`void`

(Inherited method)

---

### _updateIlluminationUniforms

```typescript
_updateIlluminationUniforms(): void
```

**Returns**  
`void`

(Inherited method)

---

### _createLightPolygon

```typescript
protected _createLightPolygon(): PointSourcePolygon
```

Creates the polygon that represents light perception. If the light perception radius is unconstrained, no new polygon instance is created; instead the LOS polygon of this vision source is returned.

**Returns**  
`PointSourcePolygon`

---

### _createRestrictedPolygon

```typescript
protected _createRestrictedPolygon(): PointSourcePolygon
```

Create a restricted FOV polygon by limiting the radius of the unrestricted LOS polygon. If the vision radius is unconstrained, no new polygon instance is created; instead the LOS polygon of this vision source is returned.

**Returns**  
`PointSourcePolygon`

---

### _updateVisionMode

```typescript
protected _updateVisionMode(): void
```

Responsible for assigning the Vision Mode and calling the activation and deactivation handlers.

**Returns**  
`void`

---

### _updateVisionModeUniforms

```typescript
protected _updateVisionModeUniforms(
    shader: AdaptiveVisionShader,
    vmUniforms: Record<string, any>
): void
```

Update layer uniforms according to vision mode uniforms, if any.

**Parameters**

- **shader**: `AdaptiveVisionShader`  
  The shader being updated.
- **vmUniforms**: `Record<string, any>`  
  The targeted layer.

**Returns**  
`void`

---

### Static Methods

#### getCorrectedColor

```typescript
static getCorrectedColor(
    level: LightingLevel,
    colorDim: Color,
    colorBright: Color,
    colorBackground?: Color
): Color
```

Get corrected color according to level, dim color, bright color and background color.

**Parameters**

- **level**: `LightingLevel`  
  The lighting level (one of [CONST.LIGHTING_LEVELS](https://foundryvtt.com/api/variables/CONST.LIGHTING_LEVELS.html))
- **colorDim**: `Color`  
- **colorBright**: `Color`  
- **colorBackground?**: `Color` (Optional)

**Returns**  
`Color`

---

#### getCorrectedLevel

```typescript
static getCorrectedLevel(level: LightingLevel): number
```

Get corrected level according to level and active vision mode data.

**Parameters**

- **level**: `LightingLevel`  
  The lighting level (one of [CONST.LIGHTING_LEVELS](https://foundryvtt.com/api/variables/CONST.LIGHTING_LEVELS.html))

**Returns**  
`number`  
The corrected level.