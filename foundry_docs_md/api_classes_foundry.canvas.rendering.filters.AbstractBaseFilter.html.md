# AbstractBaseFilter | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract filter which provides a framework for reusable definition.

**Mixes:**  
BaseShaderMixin

**Hierarchy:**  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.rendering.filters.AbstractBaseFilter)  
- Filter<this>  
- **AbstractBaseFilter**  
  - [AbstractBaseMaskFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html)  
  - [InvisibilityFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.InvisibilityFilter.html)  
  - [TextureTransitionFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.TextureTransitionFilter.html)  
  - [VoidFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.VoidFilter.html)

---

## Constructors

### constructor

```typescript
new AbstractBaseFilter(
    vertexSrc?: string,
    fragmentSrc?: string,
    uniforms?: Dict<any>,
): AbstractBaseFilter
```

**Parameters**

- **vertexSrc?**: `string`  
  The source of the vertex shader. *(Optional)*

- **fragmentSrc?**: `string`  
  The source of the fragment shader. *(Optional)*

- **uniforms?**: `Dict<any>`  
  Custom uniforms to use to augment the built-in ones. *(Optional)*

**Returns**  
`AbstractBaseFilter`  
Inherited from BaseShaderMixin(PIXI.Filter).constructor

---

## Properties

### static defaultUniforms

`object = {}`

The default uniforms used by the filter.

### static fragmentShader

`string = undefined`

The fragment shader which renders this filter.

### static vertexShader

`string = undefined`

The vertex shader which renders this filter.

---

## Methods

### static create

```typescript
create(initialUniforms?: object): AbstractBaseFilter
```

A factory method for creating the filter using its defined default values.

**Parameters**

- **initialUniforms?**: `object = {}`  
  Initial uniform values which override filter defaults *(Optional)*

**Returns**  
`AbstractBaseFilter`  
The constructed AbstractFilter instance.