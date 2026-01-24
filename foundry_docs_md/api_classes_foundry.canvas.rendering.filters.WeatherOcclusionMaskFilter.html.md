# WeatherOcclusionMaskFilter

The filter used by the weather layer to mask weather above occluded roofs.

**See:**  
[foundry.canvas.layers.WeatherEffects](https://foundryvtt.com/api/classes/foundry.canvas.layers.WeatherEffects.html)

**Hierarchy:**  
- [AbstractBaseMaskFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html)  
- WeatherOcclusionMaskFilter  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.filters.WeatherOcclusionMaskFilter)

---

## Constructors

### constructor

```typescript
new WeatherOcclusionMaskFilter(
    vertexSrc?: string,
    fragmentSrc?: string,
    uniforms?: Dict<any>
): WeatherOcclusionMaskFilter
```

**Parameters**

- **vertexSrc** _string_ (Optional)  
  The source of the vertex shader.
- **fragmentSrc** _string_ (Optional)  
  The source of the fragment shader.
- **uniforms** _Dict<any>_ (Optional)  
  Custom uniforms to use to augment the built-in ones.

**Returns**  
_WeatherOcclusionMaskFilter_

Inherited from [AbstractBaseMaskFilter.constructor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#constructor)

---

## Properties

### elevation

```typescript
elevation: number = Infinity
```

Elevation of this weather occlusion mask filter.

---

### Static Properties

#### defaultUniforms

```typescript
defaultUniforms: {
    depthElevation: number;
    occlusionTexture: null;
    occlusionWeights: number[];
    reverseOcclusion: boolean;
    reverseTerrain: boolean;
    sceneAnchor: number[];
    sceneDimensions: number[];
    terrainTexture: null;
    terrainUvMatrix: Matrix;
    terrainWeights: number[];
    useOcclusion: boolean;
    useTerrain: boolean;
} = ...
```

Overrides [AbstractBaseMaskFilter.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#defaultuniforms)

---

## Methods

### Static Properties

#### fragmentShader

```typescript
fragmentShader: string = ...
```

Overrides [AbstractBaseMaskFilter.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#fragmentshader)

#### vertexShader

```typescript
vertexShader: string = ...
```

Overrides [AbstractBaseMaskFilter.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#vertexshader)

---

### apply

```typescript
apply(
    filterManager: any,
    input: any,
    output: any,
    clear: any,
    currentState: any,
): void
```

**Parameters**

- **filterManager** _any_  
- **input** _any_  
- **output** _any_  
- **clear** _any_  
- **currentState** _any_

**Returns**  
_void_

Overrides [AbstractBaseMaskFilter.apply](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#apply)

---

### Static create

```typescript
create(initialUniforms?: object): AbstractBaseFilter
```

A factory method for creating the filter using its defined default values.

**Parameters**

- **initialUniforms** _object_ = {} (Optional)  
  Initial uniform values which override filter defaults

**Returns**  
_AbstractBaseFilter_

The constructed AbstractFilter instance.

Inherited from [AbstractBaseMaskFilter.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#create)