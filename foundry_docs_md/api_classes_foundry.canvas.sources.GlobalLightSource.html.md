# GlobalLightSource | Foundry Virtual Tabletop - API Documentation - Version 13

A specialized subclass of the `BaseLightSource` which is used to render global light source linked to the scene.

## Hierarchy
- [_BaseLightSource_](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html)
- **GlobalLightSource**

---

## Constructors

### constructor

```typescript
new GlobalLightSource(options?: BaseEffectSourceOptions): GlobalLightSource
```

An effect source is constructed by providing configuration options.

**Parameters**

- **options**?: `BaseEffectSourceOptions` = `{}`  
  Options which modify the base effect source instance

**Returns**  
`GlobalLightSource`

Inherited from [BaseLightSource.constructor](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#constructor)

---

## Properties

### customPolygon

`null | number[] | Polygon` = `null`

A custom polygon placeholder.

---

### name

`string` = `GlobalLightSource.sourceType`

Name of this global light source.

**Default Value**

`GlobalLightSource.sourceType`

---

### ratio

`number` = `1`

A ratio of dim:bright as part of the source radius.

Inherited from [BaseLightSource.ratio](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#ratio)

---

### _initializeShaderKeys

`string[]` = ...

Inherited from [BaseLightSource._initializeShaderKeys](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_initializeshaderkeys)

---

### _refreshUniformsKeys

`string[]` = ...

Inherited from [BaseLightSource._refreshUniformsKeys](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_refreshuniformskeys)

---

### defaultData

`any` = ...

Effect source default data.

Overrides [BaseLightSource.defaultData](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#defaultdata)

---

### EDGE_OFFSET

`number` = `-8`

The offset in pixels applied to create soft edges.

Inherited from [BaseLightSource.EDGE_OFFSET](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#edge_offset)

---

### effectsCollection

`string` = `"lightSources"`

Overrides [BaseLightSource.effectsCollection](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#effectscollection)

---

### sourceType

`string` = `"GlobalLight"`

Overrides [BaseLightSource.sourceType](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#sourcetype)

---

### _brightLightingLevel

`string` = `LIGHTING_LEVELS.BRIGHT`

The corresponding lighting levels for bright light.

Inherited from [BaseLightSource._brightLightingLevel](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_brightlightinglevel)

---

### _dimLightingLevel

`number` = `LIGHTING_LEVELS.DIM`

The corresponding lighting levels for dim light.

Inherited from [BaseLightSource._dimLightingLevel](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_dimlightinglevel)

---

## Accessors

### _layers

```typescript
get _layers(): {
    background: {
        blendMode: string;
        defaultShader: typeof AdaptiveBackgroundShader;
    };
    coloration: {
        blendMode: string;
        defaultShader: typeof AdaptiveColorationShader;
    };
    illumination: {
        blendMode: string;
        defaultShader: typeof AdaptiveIlluminationShader;
    };
}
```

**Returns**  
An object containing layer blend modes and default shaders.

Inherited from [BaseLightSource._layers](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_dimlightinglevel)

---

### ANIMATIONS

```typescript
get ANIMATIONS(): LightSourceAnimationConfig
```

Protected.  
The corresponding animation config.

**Returns**  
`LightSourceAnimationConfig`

Inherited from [BaseLightSource.ANIMATIONS](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#ANIMATIONS)

---

## Methods

### _createShapes

```typescript
_createShapes(): void
```

**Returns**  
`void`

---

### _initialize

```typescript
_initialize(data: any): void
```

**Parameters**

- **data**: `any`

**Returns**  
`void`

Inherited from [_BaseLightSource._initialize_](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_initialize)

---

### _initializeSoftEdges

```typescript
_initializeSoftEdges(): void
```

**Returns**  
`void`

---

### _updateBackgroundUniforms

```typescript
_updateBackgroundUniforms(): void
```

Update shader uniforms used for the background layer.

**Returns**  
`void`

Inherited from [BaseLightSource._updateBackgroundUniforms](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_updatebackgrounduniforms)

---

### _updateColorationUniforms

```typescript
_updateColorationUniforms(): void
```

Update shader uniforms used for the coloration layer.

**Returns**  
`void`

Inherited from [BaseLightSource._updateColorationUniforms](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_updatecolorationuniforms)

---

### _updateCommonUniforms

```typescript
_updateCommonUniforms(shader: any): void
```

Overrides [BaseLightSource._updateCommonUniforms](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_updatecommonuniforms)

**Parameters**

- **shader**: `any`

**Returns**  
`void`

---

### _updateGeometry

```typescript
_updateGeometry(): void
```

**Returns**  
`void`

---

### _updateIlluminationUniforms

```typescript
_updateIlluminationUniforms(): void
```

Update shader uniforms used for the illumination layer.

**Returns**  
`void`

Inherited from [BaseLightSource._updateIlluminationUniforms](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_updateilluminationuniforms)

---

### animateFlickering

```typescript
animateFlickering(
    dt: number,
    options?: {
        amplification?: number;
        intensity?: number;
        reverse?: boolean;
        speed?: number;
    },
): void
```

An animation with flickering ratio and light intensity.

**Parameters**

- **dt**: `number`  
  Delta time
- **options**?:  
  Additional options which modify the flame animation:
  - **amplification**?: `number` — Noise amplification (>1) or dampening (<1)
  - **intensity**?: `number` — The animation intensity, from 1 to 10
  - **reverse**?: `boolean` — Reverse the animation direction
  - **speed**?: `number` — The animation speed, from 0 to 10  

**Returns**  
`void`

Inherited from [BaseLightSource.animateFlickering](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#animateflickering)

---

### animatePulse

```typescript
animatePulse(
    dt: number,
    options?: { intensity?: number; reverse?: boolean; speed?: number },
): void
```

A basic "pulse" animation which expands and contracts.

**Parameters**

- **dt**: `number`  
  Delta time
- **options**?:  
  Additional options which modify the pulse animation:
  - **intensity**?: `number` — The animation intensity, from 1 to 10
  - **reverse**?: `boolean` — Reverse the animation direction
  - **speed**?: `number` — The animation speed, from 0 to 10  

**Returns**  
`void`

Inherited from [BaseLightSource.animatePulse](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#animatepulse)

---

### animateSoundPulse

```typescript
animateSoundPulse(
    dt: number,
    options?: { intensity?: number; reverse?: boolean; speed?: number },
): void
```

A sound-reactive animation that uses bass/mid/treble blending to control certain shader uniforms. "speed" is interpreted as how quickly we adapt to changes in audio. No time-based pulsing is used by default, but we incorporate dt into smoothing so that behavior is consistent across varying frame rates.

**Parameters**

- **dt**: `number`  
  The delta time since the last frame, in milliseconds.
- **options**?:  
  Additional options for customizing the audio reaction:
  - **intensity**?: `number` — A blend factor in [0..10] that transitions from bass (near 0) to treble (near 10), mid frequencies dominate around intensity=5.
  - **reverse**?: `boolean` — Whether to invert the final amplitude as 1 - amplitude.
  - **speed**?: `number` — A smoothing factor in [0..10], effectively updates/second.

**Returns**  
`void`

Inherited from [BaseLightSource.animateSoundPulse](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#animatesoundpulse)

---

### animateTorch

```typescript
animateTorch(
    dt: number,
    options?: { intensity?: number; reverse?: boolean; speed?: number },
): void
```

An animation with flickering ratio and light intensity.

**Parameters**

- **dt**: `number`  
  Delta time
- **options**?:  
  Additional options which modify the flame animation:
  - **intensity**?: `number` — The animation intensity, from 1 to 10
  - **reverse**?: `boolean` — Reverse the animation direction
  - **speed**?: `number` — The animation speed, from 0 to 10  

**Returns**  
`void`

Inherited from [BaseLightSource.animateTorch](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#animatetorch)

---

### getCorrectedColor

```typescript
static getCorrectedColor(
    level: LightingLevel,
    colorDim: Color,
    colorBright: Color,
    colorBackground?: Color,
): Color
```

Get corrected color according to level, dim color, bright color and background color.

**Parameters**

- **level**: `LightingLevel`  
  The lighting level (one of [CONST.LIGHTING_LEVELS](https://foundryvtt.com/api/variables/CONST.LIGHTING_LEVELS.html))
- **colorDim**: `Color`  
- **colorBright**: `Color`
- **colorBackground**?: `Color`  

**Returns**  
`Color`

Inherited from [BaseLightSource.getCorrectedColor](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#getcorrectedcolor)

---

### getCorrectedLevel

```typescript
static getCorrectedLevel(level: LightingLevel): number
```

Get corrected level according to level and active vision mode data.

**Parameters**

- **level**: `LightingLevel`  
  The lighting level (one of [CONST.LIGHTING_LEVELS](https://foundryvtt.com/api/variables/CONST.LIGHTING_LEVELS.html))

**Returns**  
`number`

Inherited from [BaseLightSource.getCorrectedLevel](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#getcorrectedlevel)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)