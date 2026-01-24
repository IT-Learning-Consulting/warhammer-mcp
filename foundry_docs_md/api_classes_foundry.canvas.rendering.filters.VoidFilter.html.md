# VoidFilter

A minimalist filter (just used for blending).

---

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.filters.VoidFilter), Expand  
- *AbstractBaseFilter*  
- **VoidFilter**

---

## Constructors

### constructor

```typescript
new VoidFilter(
    vertexSrc?: string,
    fragmentSrc?: Dict<any>,
    uniforms?: Dict<any>,
): VoidFilter
```

**Parameters**

- **vertexSrc**: *string* (Optional)  
  The source of the vertex shader.

- **fragmentSrc**: *string* (Optional)  
  The source of the fragment shader.

- **uniforms**: *Dict<any>* (Optional)  
  Custom uniforms to use to augment the built-in ones.

**Returns**  
*VoidFilter*  

Inherited from [AbstractBaseFilter.constructor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#constructor).

---

## Properties

### static defaultUniforms

```typescript
static defaultUniforms: object = {}
```

The default uniforms used by the filter.  

Inherited from [AbstractBaseFilter.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#defaultuniforms).

---

### static fragmentShader

```typescript
static fragmentShader: string = ...
```

Overrides [AbstractBaseFilter.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#fragmentshader).

---

### static vertexShader

```typescript
static vertexShader: string = undefined
```

The vertex shader which renders this filter.  

Inherited from [AbstractBaseFilter.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#vertexshader).

---

## Methods

### static create

```typescript
static create(initialUniforms?: object): AbstractBaseFilter
```

A factory method for creating the filter using its defined default values.

**Parameters**

- **initialUniforms**: *object = {}* (Optional)  
  Initial uniform values which override filter defaults.

**Returns**  
*AbstractBaseFilter*  
The constructed AbstractFilter instance.  

Inherited from [AbstractBaseFilter.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseFilter.html#create).

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)