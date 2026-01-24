# PointDarknessSource

A specialized subclass of the `BaseLightSource` which renders a source of darkness as a point-based effect.

Mixes:  
- PointEffectSource

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.sources.PointDarknessSource)):
- `BaseLightSource` < this >
- `PointDarknessSource`

---

## Constructors

### constructor

```typescript
new PointDarknessSource(options?: BaseEffectSourceOptions): PointDarknessSource
```

An effect source is constructed by providing configuration options.

**Parameters**

- **options?**: `BaseEffectSourceOptions = {}`  
  Options which modify the base effect source instance.

**Returns**  
`PointDarknessSource`

Inherited from [`BaseLightSource.constructor`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#constructor)

---

## Properties

### ratio

`ratio: number = 1`

A ratio of dim:bright as part of the source radius.

Inherited from [`BaseLightSource.ratio`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#ratio)

### Protected

#### _padding

`_padding: number = ...`

Padding applied on the darkness source shape for visual appearance only.  
*Note: for now, padding is increased radius. It might evolve in a future release.*

#### _visualShape

`_visualShape: SourceShape`

The optional geometric shape is solely utilized for visual representation regarding darkness sources. Used only when an additional radius is added for visuals.

### Static

#### _brightLightingLevel

`_brightLightingLevel: -2 = LIGHTING_LEVELS.DARKNESS`

Inherited from [`BaseLightSource._brightLightingLevel`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_brightlightinglevel)

#### _dimLightingLevel

`_dimLightingLevel: -1 = LIGHTING_LEVELS.HALFDARK`

Inherited from [`BaseLightSource._dimLightingLevel`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_dimlightinglevel)

#### _initializeShaderKeys

`_initializeShaderKeys: string[] = ...`

Inherited from [`BaseLightSource._initializeShaderKeys`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_initializeshaderkeys)

#### _refreshUniformsKeys

`_refreshUniformsKeys: string[] = ...`

Inherited from [`BaseLightSource._refreshUniformsKeys`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_refreshuniformskeys)

#### defaultData

`defaultData: any = ...`

Effect source default data.

Inherited from [`BaseLightSource.defaultData`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#defaultdata)

#### EDGE_OFFSET

`EDGE_OFFSET: number = -8`

The offset in pixels applied to create soft edges.

Inherited from [`BaseLightSource.EDGE_OFFSET`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#edge_offset)

#### effectsCollection

`effectsCollection: string = "darknessSources"`

Inherited from [`BaseLightSource.effectsCollection`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#effectscollection)

---

## Accessors

### Static

#### sourceType

`sourceType: string = "darkness"`

Inherited from [`BaseLightSource.sourceType`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#sourcetype)

### darkness

```typescript
get darkness(): PointSourceMesh
```

A convenience accessor to the darkness layer mesh.

**Returns**  
`PointSourceMesh`

### requiresEdges

```typescript
get requiresEdges(): boolean
```

**Returns**  
`boolean`

### Static

#### _layers

```typescript
get _layers(): {
    darkness: {
        blendMode: string;
        defaultShader: typeof AdaptiveDarknessShader;
    };
}
```

**Returns**

```typescript
{
    darkness: {
        blendMode: string;
        defaultShader: typeof AdaptiveDarknessShader;
    };
}
```

#### ANIMATIONS

```typescript
get ANIMATIONS(): DarknessSourceAnimationConfig
```

**Returns**  
`DarknessSourceAnimationConfig`

---

## Methods

### _createShapes

```typescript
_createShapes(): void
```

**Returns**  
`void`

### _drawMesh

```typescript
_drawMesh(layerId: any): any
```

**Parameters**

- **layerId**: `any`

**Returns**  
`any`

Inherit Doc

### _getPolygonConfiguration

```typescript
_getPolygonConfiguration(): any
```

**Returns**  
`any`

Inherit Doc

### _initialize

```typescript
_initialize(data: any): void
```

**Parameters**

- **data**: `any`

**Returns**  
`void`

Overrides [`BaseLightSource._initialize`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_initialize)

### _updateBackgroundUniforms

```typescript
_updateBackgroundUniforms(): void
```

Update shader uniforms used for the background layer.

**Returns**  
`void`

Inherited from [`BaseLightSource._updateBackgroundUniforms`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_updatebackgrounduniforms)

### _updateColorationUniforms

```typescript
_updateColorationUniforms(): void
```

Update shader uniforms used for the coloration layer.

**Returns**  
`void`

Inherited from [`BaseLightSource._updateColorationUniforms`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_updatecolorationuniforms)

### _updateCommonUniforms

```typescript
_updateCommonUniforms(shader: any): void
```

**Parameters**

- **shader**: `any`

**Returns**  
`void`

Inherited from [`BaseLightSource._updateCommonUniforms`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_updatecommonuniforms)

### _updateGeometry

```typescript
_updateGeometry(): void
```

**Returns**  
`void`

### _updateIlluminationUniforms

```typescript
_updateIlluminationUniforms(): void
```

Update shader uniforms used for the illumination layer.

**Returns**  
`void`

Inherited from [`BaseLightSource._updateIlluminationUniforms`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#_updateilluminationuniforms)

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

- **options?**:  
  - **amplification?**: `number` — Noise amplification (>1) or dampening (<1)  
  - **intensity?**: `number` — The animation intensity, from 1 to 10  
  - **reverse?**: `boolean` — Reverse the animation direction  
  - **speed?**: `number` — The animation speed, from 0 to 10

**Returns**  
`void`

Inherited from [`BaseLightSource.animateFlickering`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#animateflickering)

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

- **options?**:  
  - **intensity?**: `number` — The animation intensity, from 1 to 10  
  - **reverse?**: `boolean` — Reverse the animation direction  
  - **speed?**: `number` — The animation speed, from 0 to 10

**Returns**  
`void`

Inherited from [`BaseLightSource.animatePulse`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#animatepulse)

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

A sound-reactive animation that uses bass/mid/treble blending to control certain shader uniforms.  
"speed" is interpreted as how quickly we adapt to changes in audio. No time-based pulsing is used by default, but we incorporate dt into smoothing so that behavior is consistent across varying frame rates.

**Parameters**

- **dt**: `number`  
  The delta time since the last frame, in milliseconds.

- **options?**:  
  - **intensity?**: `number` — A blend factor in [0..10] that transitions from bass (near 0) to treble (near 10). Mid frequencies dominate around intensity=5.  
  - **reverse?**: `boolean` — Whether to invert the final amplitude as 1 - amplitude.  
  - **speed?**: `number` — A smoothing factor in [0..10], effectively updates/second.

**Returns**  
`void`

Inherited from [`BaseLightSource.animateSoundPulse`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#animatesoundpulse)

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

- **options?**:  
  - **intensity?**: `number` — The animation intensity, from 1 to 10  
  - **reverse?**: `boolean` — Reverse the animation direction  
  - **speed?**: `number` — The animation speed, from 0 to 10

**Returns**  
`void`

Inherited from [`BaseLightSource.animateTorch`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#animatetorch)

### testPoint

```typescript
testPoint(point: any): boolean
```

**Parameters**

- **point**: `any`

**Returns**  
`boolean`

### Protected

#### _updateDarknessUniforms

```typescript
_updateDarknessUniforms(): void
```

Update the uniforms of the shader on the darkness layer.

**Returns**  
`void`

---

## Static Methods

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
- **colorBackground?**: `Color`

**Returns**  
`Color`

Inherited from [`BaseLightSource.getCorrectedColor`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#getcorrectedcolor)

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

Inherited from [`BaseLightSource.getCorrectedLevel`](https://foundryvtt.com/api/classes/foundry.canvas.sources.BaseLightSource.html#getcorrectedlevel)

---

For full details, see the [PointDarknessSource API documentation](https://foundryvtt.com/api/classes/foundry.canvas.sources.PointDarknessSource.html).