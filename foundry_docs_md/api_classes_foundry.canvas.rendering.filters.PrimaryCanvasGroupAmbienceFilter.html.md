# PrimaryCanvasGroupAmbienceFilter | Foundry Virtual Tabletop - API Documentation - Version 13

A filter used to apply color adjustments and other modifications to the environment.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.filters.PrimaryCanvasGroupAmbienceFilter)  
- *AbstractBaseMaskFilter*  
- **PrimaryCanvasGroupAmbienceFilter**

---

## Constructors

### constructor

```typescript
new PrimaryCanvasGroupAmbienceFilter(
    vertexSrc?: string,
    fragmentSrc?: string,
    uniforms?: Dict<any>,
): PrimaryCanvasGroupAmbienceFilter
```

**Parameters**

- **vertexSrc**: *string* (Optional)  
  The source of the vertex shader.
- **fragmentSrc**: *string* (Optional)  
  The source of the fragment shader.
- **uniforms**: *Dict<any>* (Optional)  
  Custom uniforms to use to augment the built-in ones.

**Returns**  
*PrimaryCanvasGroupAmbienceFilter*  

Inherited from [AbstractBaseMaskFilter.constructor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#constructor)

---

## Properties

### Static

#### defaultUniforms

```typescript
defaultUniforms: {
    baseIntensity: number;
    baseLuminosity: number;
    baseSaturation: number;
    baseShadows: number;
    baseTint: number[];
    cycle: boolean;
    darkIntensity: number;
    darkLuminosity: number;
    darknessLevelTexture: null;
    darkSaturation: number;
    darkShadows: number;
    darkTint: number[];
    uSampler: null;
} = ...
```

Overrides [AbstractBaseMaskFilter.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#defaultuniforms)

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

**Parameters**

- **filterManager**: *any*  
- **input**: *any*  
- **output**: *any*  
- **clear**: *any*  
- **currentState**: *any*  

**Returns**  
*void*  

Inherited from [AbstractBaseMaskFilter.apply](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#apply)

---

### Static create

```typescript
create(initialUniforms?: object): AbstractBaseFilter
```

A factory method for creating the filter using its defined default values.

**Parameters**

- **initialUniforms**: *object* = {} (Optional)  
  Initial uniform values which override filter defaults

**Returns**  
*AbstractBaseFilter*  

The constructed AbstractFilter instance.  

Inherited from [AbstractBaseMaskFilter.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#create)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)