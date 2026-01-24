# PointLightSource | Foundry Virtual Tabletop - API Documentation - Version 13

A specialized subclass of the `BaseLightSource` which renders a source of light as a point-based effect.

Mixes:  
**PointEffectSourceMixin**

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.sources.PointLightSource), Expand):

- _BaseLightSource_ < this >
- **PointLightSource**

## Constructors

### constructor

```typescript
new PointLightSource(options?: BaseEffectSourceOptions): PointLightSource
```

An effect source is constructed by providing configuration options.

**Parameters**

- **options**?: `BaseEffectSourceOptions = {}`  
  Options which modify the base effect source instance

**Returns**  
`PointLightSource`

Inherited from [BaseLightSource.constructor](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#constructor)

## Properties

### ratio

`ratio: number = 1`

A ratio of dim:bright as part of the source radius

Inherited from [BaseLightSource.ratio](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#ratio)

### Static: _initializeShaderKeys

`_initializeShaderKeys: string[] = ...`

Inherited from [BaseLightSource._initializeShaderKeys](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_initializeshaderkeys)

### Static: _refreshUniformsKeys

`_refreshUniformsKeys: string[] = ...`

Inherited from [BaseLightSource._refreshUniformsKeys](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_refreshuniformskeys)

### Static: defaultData

`defaultData: any = ...`

Effect source default data.

Inherited from [BaseLightSource.defaultData](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#defaultdata)

### Static: EDGE_OFFSET

`EDGE_OFFSET: number = -8`

The offset in pixels applied to create soft edges.

Inherited from [BaseLightSource.EDGE_OFFSET](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#edge_offset)

### Static Accessors

#### effectsCollection

`effectsCollection: string = "lightSources"`

Inherited from [BaseLightSource.effectsCollection](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#effectscollection)

#### sourceType

`sourceType: string = "light"`

Inherited from [BaseLightSource.sourceType](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#sourcetype)

### Static Protected Properties

#### _brightLightingLevel

`_brightLightingLevel: string = LIGHTING_LEVELS.BRIGHT`

The corresponding lighting levels for bright light.

Inherited from [BaseLightSource._brightLightingLevel](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_brightlightinglevel)

#### _dimLightingLevel

`_dimLightingLevel: number = LIGHTING_LEVELS.DIM`

The corresponding lighting levels for dim light.

Inherited from [BaseLightSource._dimLightingLevel](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_dimlightinglevel)

### requiresEdges

```typescript
get requiresEdges(): boolean
```

**Returns**  
`boolean`

## Methods

### Static Accessors

#### _layers

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

- **background**:  
  - `blendMode: string`  
  - `defaultShader: typeof AdaptiveBackgroundShader`
- **coloration**:  
  - `blendMode: string`  
  - `defaultShader: typeof AdaptiveColorationShader`
- **illumination**:  
  - `blendMode: string`  
  - `defaultShader: typeof AdaptiveIlluminationShader`

#### ANIMATIONS

```typescript
get ANIMATIONS(): LightSourceAnimationConfig
```

Protected  
The corresponding animation config.

**Returns**  
`LightSourceAnimationConfig`

---

### _configure

```typescript
_configure(changes: any): void
```

**Parameters**

- **changes**: `any`

**Returns**  
`void`

(Inherited)

---

### _createShapes

```typescript
_createShapes(): void
```

**Returns**  
`void`

(Inherited)

---

### _getPolygonConfiguration

```typescript
_getPolygonConfiguration(): any
```

**Returns**  
`any`

(Inherited)

---

### _initialize

```typescript
_initialize(data: any): void
```

**Parameters**

- **data**: `any`

**Returns**  
`void`

Overrides [BaseLightSource._initialize](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_initialize)

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

**Parameters**

- **shader**: `any`

**Returns**  
`void`

Inherited from [BaseLightSource._updateCommonUniforms](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_updatecommonuniforms)

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

An animation with flickering ratio and light intensity

**Parameters**

- **dt**: `number`  
  Delta time
- **options**?:  
  Additional options which modify the flame animation
  - **amplification**?: `number`  
    Noise amplification (>1) or dampening (<1)
  - **intensity**?: `number`  
    The animation intensity, from 1 to 10
  - **reverse**?: `boolean`  
    Reverse the animation direction
  - **speed**?: `number`  
    The animation speed, from 0 to 10

**Returns**  
`void`

Inherited from [BaseLightSource.animateFlickering](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#animateFlickering)

---

### animatePulse

```typescript
animatePulse(
    dt: number,
    options?: {
        intensity?: number;
        reverse?: boolean;
        speed?: number;
    },
): void
```

A basic "pulse" animation which expands and contracts.

**Parameters**

- **dt**: `number`  
  Delta time
- **options**?:  
  Additional options which modify the pulse animation
  - **intensity**?: `number`  
    The animation intensity, from 1 to 10
  - **reverse**?: `boolean`  
    Reverse the animation direction
  - **speed**?: `number`  
    The animation speed, from 0 to 10

**Returns**  
`void`

Inherited from [BaseLightSource.animatePulse](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#animatePulse)

---

### animateSoundPulse

```typescript
animateSoundPulse(
    dt: number,
    options?: {
        intensity?: number;
        reverse?: boolean;
        speed?: number;
    },
): void
```

A sound-reactive animation that uses bass/mid/treble blending to control certain shader uniforms. "speed" is interpreted as how quickly we adapt to changes in audio. No time-based pulsing is used by default, but we incorporate dt into smoothing so that behavior is consistent across varying frame rates.

**Parameters**

- **dt**: `number`  
  The delta time since the last frame, in milliseconds.
- **options**?:  
  Additional options for customizing the audio reaction
  - **intensity**?: `number`  
    A blend factor in [0..10] that transitions from bass (near 0) to treble (near 10) Mid frequencies dominate around intensity=5.
  - **reverse**?: `boolean`  
    Whether to invert the final amplitude as 1 - amplitude.
  - **speed**?: `number`  
    A smoothing factor in [0..10], effectively updates/second.

**Returns**  
`void`

Inherited from [BaseLightSource.animateSoundPulse](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#animateSoundPulse)

---

### animateTorch

```typescript
animateTorch(
    dt: number,
    options?: {
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
  Additional options which modify the flame animation
  - **intensity**?: `number`  
    The animation intensity, from 1 to 10
  - **reverse**?: `boolean`  
    Reverse the animation direction
  - **speed**?: `number`  
    The animation speed, from 0 to 10

**Returns**  
`void`

Inherited from [BaseLightSource.animateTorch](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#animateTorch)

---

### testVisibility

```typescript
testVisibility(config: CanvasVisibilityTestConfiguration): boolean
```

Test whether this LightSource provides visibility to see a certain target object.

**Parameters**

- **config**: `CanvasVisibilityTestConfiguration`  
  The visibility test configuration

**Returns**  
`boolean`  
Is the target object visible to this source?

---

### _canDetectObject

```typescript
_canDetectObject(target: PlaceableObject): boolean
```

Protected  
Can this LightSource theoretically detect a certain object based on its properties? This check should not consider the relative positions of either object, only their state.

**Parameters**

- **target**: `PlaceableObject`  
  The target object being tested

**Returns**  
`boolean`  
Can the target object theoretically be detected by this vision source?

---

### Static Methods

#### getCorrectedColor

```typescript
getCorrectedColor(
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

Inherited from [BaseLightSource.getCorrectedColor](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#getCorrectedColor)

---

#### getCorrectedLevel

```typescript
getCorrectedLevel(level: LightingLevel): number
```

Get corrected level according to level and active vision mode data.

**Parameters**

- **level**: `LightingLevel`  
  The lighting level (one of [CONST.LIGHTING_LEVELS](https://foundryvtt.com/api/variables/CONST.LIGHTING_LEVELS.html))

**Returns**  
`number`  
The corrected level.

Inherited from [BaseLightSource.getCorrectedLevel](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#getCorrectedLevel)

---

For more information, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).