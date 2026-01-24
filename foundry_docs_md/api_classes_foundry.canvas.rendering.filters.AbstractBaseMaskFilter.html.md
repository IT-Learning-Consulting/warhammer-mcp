# AbstractBaseMaskFilter | Foundry Virtual Tabletop - API Documentation - Version 13

This class defines an interface for masked custom filters.

## Hierarchy  
- [AbstractBaseFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html)  
- **AbstractBaseMaskFilter**  
- [VisualEffectsMaskingFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.VisualEffectsMaskingFilter.html)  
- [PrimaryCanvasGroupAmbienceFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.PrimaryCanvasGroupAmbienceFilter.html)  
- [VisibilityFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.VisibilityFilter.html)  
- [WeatherOcclusionMaskFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.WeatherOcclusionMaskFilter.html)  

---

## Constructors

### constructor

```typescript
new AbstractBaseMaskFilter(
    vertexSrc?: string,
    fragmentSrc?: string,
    uniforms?: Dict<any>,
): AbstractBaseMaskFilter
```

**Parameters:**

- **vertexSrc**: `string` (Optional)  
  The source of the vertex shader.
- **fragmentSrc**: `string` (Optional)  
  The source of the fragment shader.
- **uniforms**: `Dict<any>` (Optional)  
  Custom uniforms to use to augment the built-in ones.

**Returns:**  
`AbstractBaseMaskFilter`

_Inherited from [AbstractBaseFilter.constructor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#constructor)_

---

## Properties

### static defaultUniforms

```typescript
defaultUniforms: object = {}
```

The default uniforms used by the filter.

_Inherited from [AbstractBaseFilter.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#defaultuniforms)_

---

### static fragmentShader

```typescript
fragmentShader: string = undefined
```

The fragment shader which renders this filter.

_Inherited from [AbstractBaseFilter.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#fragmentshader)_

---

### static vertexShader

```typescript
vertexShader: string = ...
```

The default vertex shader used by all instances of `AbstractBaseMaskFilter`.

Overrides [AbstractBaseFilter.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#vertexshader)

---

## Methods

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

**Parameters:**

- **filterManager**: `any`  
- **input**: `any`  
- **output**: `any`  
- **clear**: `any`  
- **currentState**: `any`  

**Returns:**  
`void`

Overrides `AbstractBaseFilter.apply`

---

### static create

```typescript
create(initialUniforms?: object): AbstractBaseFilter
```

A factory method for creating the filter using its defined default values.

**Parameters:**

- **initialUniforms**: `object` = {} (Optional)  
  Initial uniform values which override filter defaults.

**Returns:**  
`AbstractBaseFilter`

The constructed `AbstractBaseFilter` instance.

_Inherited from [AbstractBaseFilter.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#create)_

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)