# InvisibilityFilter | Foundry Virtual Tabletop - API Documentation - Version 13

Invisibility effect filter for placeables.

## Hierarchy  
- [AbstractBaseFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html)  
- **InvisibilityFilter**

---

## Constructors

### constructor

```typescript
new InvisibilityFilter(
    vertexSrc?: string,
    fragmentSrc?: string,
    uniforms?: Dict<any>,
): InvisibilityFilter
```

**Parameters**

- **vertexSrc**: *string* (Optional)  
  The source of the vertex shader.
- **fragmentSrc**: *string* (Optional)  
  The source of the fragment shader.
- **uniforms**: *Dict<any>* (Optional)  
  Custom uniforms to use to augment the built-in ones.

**Returns**  
*InvisibilityFilter*  

Inherited from [AbstractBaseFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#constructor).

---

## Properties

### static defaultUniforms

```typescript
defaultUniforms: { color: number[]; uSampler: null } = ...
```

Overrides [AbstractBaseFilter.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#defaultuniforms).

---

### static fragmentShader

```typescript
fragmentShader: string = ...
```

Overrides [AbstractBaseFilter.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#fragmentshader).

---

### static vertexShader

```typescript
vertexShader: string = undefined
```

The vertex shader which renders this filter.  
Inherited from [AbstractBaseFilter.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#vertexshader).

---

## Methods

### static create

```typescript
create(initialUniforms?: object): AbstractBaseFilter
```

A factory method for creating the filter using its defined default values.

**Parameters**

- **initialUniforms**: *object* = {} (Optional)  
  Initial uniform values which override filter defaults.

**Returns**  
*AbstractBaseFilter*  
The constructed AbstractFilter instance.  

Inherited from [AbstractBaseFilter.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#create).

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)