# BaseLightSource | Foundry Virtual Tabletop - API Documentation - Version 13

A specialized subclass of `BaseEffectSource` which deals with the rendering of light or darkness.

---

## Hierarchy

- *[RenderedEffectSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html)*
- **BaseLightSource**
- *[GlobalLightSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.GlobalLightSource.html)*
- *[PointDarknessSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointDarknessSource.html)*
- *[PointLightSource](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointLightSource.html)*

---

## Constructors

### constructor

```typescript
new BaseLightSource(options?: BaseEffectSourceOptions): BaseLightSource
```

An effect source is constructed by providing configuration options.

**Parameters**

- **options?**: `BaseEffectSourceOptions` = `{}`  
  Options which modify the base effect source instance

**Returns** `BaseLightSource`

_Inherited from [RenderedEffectSource.constructor](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#constructor)_

---

## Properties

### ratio

`ratio: number = 1`

A ratio of dim:bright as part of the source radius.

---

### Static Properties

#### _initializeShaderKeys

`static _initializeShaderKeys: string[] = ...`

Overrides [RenderedEffectSource._initializeShaderKeys](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#_initializeshaderkeys)

#### _refreshUniformsKeys

`static _refreshUniformsKeys: string[] = ...`

Overrides [RenderedEffectSource._refreshUniformsKeys](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#_refreshuniformskeys)

#### defaultData

`static defaultData: any = ...`

Effect source default data.

Overrides [RenderedEffectSource.defaultData](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#defaultData)

#### EDGE_OFFSET

`static EDGE_OFFSET: number = -8`

The offset in pixels applied to create soft edges.

Inherited from [RenderedEffectSource.EDGE_OFFSET](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#edge_offset)

---

### Abstract Properties

#### effectsCollection

`static effectsCollection: string`

The target collection into the effects canvas group.

Inherited from [RenderedEffectSource.effectsCollection](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#effectscollection)

---

## Accessors

### sourceType

`static sourceType: string = "light"`

Overrides [RenderedEffectSource.sourceType](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#sourceType)

---

### Protected Static Properties

#### _brightLightingLevel

`static _brightLightingLevel: string = LIGHTING_LEVELS.BRIGHT`

The corresponding lighting level for bright light.

#### _dimLightingLevel

`static _dimLightingLevel: number = LIGHTING_LEVELS.DIM`

The corresponding lighting level for dim light.

---

### _layers

```typescript
static get _layers(): {
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

Overrides [RenderedEffectSource._layers](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#_layers)

---

### ANIMATIONS

```typescript
static get ANIMATIONS(): LightSourceAnimationConfig
```

The corresponding animation config.

**Returns** `LightSourceAnimationConfig`

_Protected_

---

## Methods

### _initialize

```typescript
_initialize(data: any): void
```

Inherited from [RenderedEffectSource._initialize](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#_initialize)

**Parameters**

- **data**: `any`

**Returns** `void`

---

### _updateBackgroundUniforms

```typescript
_updateBackgroundUniforms(): void
```

Update shader uniforms used for the background layer.

Inherited from [RenderedEffectSource._updateBackgroundUniforms](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#_updateBackgroundUniforms)

**Returns** `void`

---

### _updateColorationUniforms

```typescript
_updateColorationUniforms(): void
```

Update shader uniforms used for the coloration layer.

Inherited from [RenderedEffectSource._updateColorationUniforms](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#_updateColorationUniforms)

**Returns** `void`

---

### _updateCommonUniforms

```typescript
_updateCommonUniforms(shader: any): void
```

Inherited from [RenderedEffectSource._updateCommonUniforms](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#_updateCommonUniforms)

**Parameters**

- **shader**: `any`

**Returns** `void`

---

### _updateIlluminationUniforms

```typescript
_updateIlluminationUniforms(): void
```

Update shader uniforms used for the illumination layer.

Inherited from [RenderedEffectSource._updateIlluminationUniforms](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#_updateIlluminationUniforms)

**Returns** `void`

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
  }
): void
```

An animation with flickering ratio and light intensity.

**Parameters**

- **dt**: `number`  
  Delta time

- **options?**:  
  Additional options which modify the flame animation.

  - **amplification?**: `number`  
    Noise amplification (>1) or dampening (<1)

  - **intensity?**: `number`  
    The animation intensity, from 1 to 10

  - **reverse?**: `boolean`  
    Reverse the animation direction

  - **speed?**: `number`  
    The animation speed, from 0 to 10

**Returns** `void`

---

### animatePulse

```typescript
animatePulse(
  dt: number,
  options?: {
    intensity?: number;
    reverse?: boolean;
    speed?: number;
  }
): void
```

A basic "pulse" animation which expands and contracts.

**Parameters**

- **dt**: `number`  
  Delta time

- **options?**:  
  Additional options which modify the pulse animation.

  - **intensity?**: `number`  
    The animation intensity, from 1 to 10

  - **reverse?**: `boolean`  
    Reverse the animation direction

  - **speed?**: `number`  
    The animation speed, from 0 to 10

**Returns** `void`

---

### animateSoundPulse

```typescript
animateSoundPulse(
  dt: number,
  options?: {
    intensity?: number;
    reverse?: boolean;
    speed?: number;
  }
): void
```

A sound-reactive animation that uses bass/mid/treble blending to control certain shader uniforms.  
"speed" is interpreted as how quickly we adapt to changes in audio. No time-based pulsing is used by default, but we incorporate `dt` into smoothing so that behavior is consistent across varying frame rates.

**Parameters**

- **dt**: `number`  
  The delta time since the last frame, in milliseconds.

- **options?**:  
  Additional options for customizing the audio reaction.

  - **intensity?**: `number`  
    A blend factor in [0..10] that transitions from bass (near 0) to treble (near 10). Mid frequencies dominate around intensity=5.

  - **reverse?**: `boolean`  
    Whether to invert the final amplitude as 1 - amplitude.

  - **speed?**: `number`  
    A smoothing factor in [0..10], effectively updates per second.

**Returns** `void`

---

### animateTorch

```typescript
animateTorch(
  dt: number,
  options?: {
    intensity?: number;
    reverse?: boolean;
    speed?: number;
  }
): void
```

An animation with flickering ratio and light intensity.

**Parameters**

- **dt**: `number`  
  Delta time

- **options?**:  
  Additional options which modify the flame animation.

  - **intensity?**: `number`  
    The animation intensity, from 1 to 10

  - **reverse?**: `boolean`  
    Reverse the animation direction

  - **speed?**: `number`  
    The animation speed, from 0 to 10

**Returns** `void`

---

### getCorrectedColor

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
  The dim color.

- **colorBright**: `Color`  
  The bright color.

- **colorBackground?**: `Color`  
  Optional background color.

**Returns** `Color`

Inherited from [RenderedEffectSource.getCorrectedColor](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#getCorrectedColor)

---

### getCorrectedLevel

```typescript
static getCorrectedLevel(level: LightingLevel): number
```

Get corrected level according to level and active vision mode data.

**Parameters**

- **level**: `LightingLevel`  
  The lighting level (one of [CONST.LIGHTING_LEVELS](https://foundryvtt.com/api/variables/CONST.LIGHTING_LEVELS.html))

**Returns** `number`  
The corrected level.

Inherited from [RenderedEffectSource.getCorrectedLevel](https://foundryvtt.com/api/classes/foundry.canvas.sources.RenderedEffectSource.html#getCorrectedLevel)