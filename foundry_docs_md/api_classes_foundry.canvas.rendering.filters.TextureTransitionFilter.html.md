# TextureTransitionFilter

A filter specialized for transition effects between a source object and a target texture.

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.filters.TextureTransitionFilter), Expand)  
_AbstractBaseFilter_  
**TextureTransitionFilter**

---

## Constructors

### constructor

```typescript
new TextureTransitionFilter(
    vertexSrc?: string,
    fragmentSrc?: string,
    uniforms?: Dict<any>,
): TextureTransitionFilter
```

**Parameters**

- **vertexSrc**: *string* (Optional)  
  The source of the vertex shader.

- **fragmentSrc**: *string* (Optional)  
  The source of the fragment shader.

- **uniforms**: *Dict<any>* (Optional)  
  Custom uniforms to use to augment the built-in ones.

**Returns**  
*TextureTransitionFilter*

> Inherited from [AbstractBaseFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html).  
> See: [AbstractBaseFilter.constructor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#constructor)

---

## Properties

### defaultUniforms

```typescript
static defaultUniforms: {
    anchor: { x: number; y: number };
    filterMatrix: Matrix;
    filterMatrixInverse: Matrix;
    progress: number;
    rotation: number;
    targetTexture: null;
    targetUVMatrix: Matrix;
    tintAlpha: number[];
    type: number;
} = ...
```

The default uniforms used by the filter.

Overrides [AbstractBaseFilter.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#defaultuniforms).

---

### fragmentShader

```typescript
static fragmentShader: string = ...
```

The fragment shader which renders this filter.

Overrides [AbstractBaseFilter.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#fragmentshader).

---

### vertexShader

```typescript
static vertexShader: string = ...
```

The vertex shader which renders this filter.

Overrides [AbstractBaseFilter.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#vertexshader).

---

## Accessors

### targetTexture

```typescript
set targetTexture(targetTexture: Texture<Resource>): void
```

Sampler target for this filter.

**Parameters**

- **targetTexture**: *Texture<Resource>*

**Returns**  
void

---

### type

```typescript
get type(): string
```

The transition type (see [TextureTransitionFilter.TYPES](#types)).

**Returns**  
string

**Default Value**  
`TextureTransitionFilter.TYPES.FADE`

---

### TYPES

```typescript
get TYPES(): Readonly<{
    CROSSHATCH: "crosshatch";
    DOTS: "dots";
    FADE: "fade";
    GLITCH: "glitch";
    HOLE: "hole";
    HOLE_SWIRL: "holeSwirl";
    HOLOGRAM: "hologram";
    MORPH: "morph";
    SWIRL: "swirl";
    WATER_DROP: "waterDrop";
    WAVES: "waves";
    WHITE_NOISE: "whiteNoise";
    WIND: "wind";
}>
```

Transition types for this shader.

**Returns**  
Readonly object with keys and values as follows:

- **CROSSHATCH**: `"crosshatch"`
- **DOTS**: `"dots"`
- **FADE**: `"fade"`
- **GLITCH**: `"glitch"`
- **HOLE**: `"hole"`
- **HOLE_SWIRL**: `"holeSwirl"`
- **HOLOGRAM**: `"hologram"`
- **MORPH**: `"morph"`
- **SWIRL**: `"swirl"`
- **WATER_DROP**: `"waterDrop"`
- **WAVES**: `"waves"`
- **WHITE_NOISE**: `"whiteNoise"`
- **WIND**: `"wind"`

---

## Methods

### apply

```typescript
apply(filterManager: any, input: any, output: any, clear: any): void
```

**Parameters**

- **filterManager**: *any*  
- **input**: *any*  
- **output**: *any*  
- **clear**: *any*

**Returns**  
void

> Overrides AbstractBaseFilter.apply

---

### static animate

```typescript
static animate(
    subject: SpriteMesh | Sprite,
    texture: Texture<Resource>,
    options?: {
        duration?: number;
        easing?: string | Function;
        name?: string | symbol;
        type?: string;
    },
): Promise<boolean>
```

Animate a transition from a subject SpriteMesh/PIXI.Sprite to a given texture.

**Parameters**

- **subject**: [SpriteMesh](https://foundryvtt.com/api/classes/foundry.canvas.containers.SpriteMesh.html) | *Sprite*  
  The source mesh/sprite to apply a transition.

- **texture**: *Texture<Resource>*  
  The target texture.

- **options**: (Optional)  
  An object with optional properties:
  - **duration**?: *number*  
    The animation duration.
  - **easing**?: *string* | *Function*  
    The easing function of the animation.
  - **name**?: *string* | *symbol*  
    The name of the [foundry.canvas.animation.CanvasAnimation](https://foundryvtt.com/api/classes/foundry.canvas.animation.CanvasAnimation.html).
  - **type**?: *string*  
    The transition type (default to FADE).

**Returns**  
*Promise<boolean>*  
A Promise which resolves to true once the animation has concluded or false if the animation was prematurely terminated.

---

### static create

```typescript
static create(initialUniforms?: object): AbstractBaseFilter
```

A factory method for creating the filter using its defined default values.

**Parameters**

- **initialUniforms**: *object* (Optional, default `{}`)  
  Initial uniform values which override filter defaults.

**Returns**  
*AbstractBaseFilter*  
The constructed AbstractFilter instance.

> Inherited from [AbstractBaseFilter.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#create)