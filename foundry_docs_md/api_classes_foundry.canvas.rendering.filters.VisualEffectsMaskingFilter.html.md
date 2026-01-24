# VisualEffectsMaskingFilter

This filter handles masking and post-processing for visual effects.

## Hierarchy  
- [AbstractBaseMaskFilter](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html)  
- **VisualEffectsMaskingFilter**

---

## Constructors

```typescript
new VisualEffectsMaskingFilter(
    vertexSrc?: string,
    fragmentSrc?: string,
    uniforms?: Dict<any>,
): VisualEffectsMaskingFilter
```

**Parameters**

- **vertexSrc**: *string* (Optional)  
  The source of the vertex shader.

- **fragmentSrc**: *string* (Optional)  
  The source of the fragment shader.

- **uniforms**: *Dict<any>* (Optional)  
  Custom uniforms to use to augment the built-in ones.

**Returns**: *VisualEffectsMaskingFilter*  
Inherited from [AbstractBaseMaskFilter.constructor](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#constructor)

---

## Static Properties

### defaultUniforms

```typescript
defaultUniforms: {
    ambientDarkness: number[];
    ambientDaylight: number[];
    contrast: number;
    darknessLevelTexture: null;
    enableVisionMasking: boolean;
    exposure: number;
    mode: number;
    replacementColor: number[];
    saturation: number;
    screenDimensions: number[];
    tint: number[];
    visionTexture: null;
} = ...
```

Overrides [AbstractBaseMaskFilter.defaultUniforms](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#defaultuniforms)

---

### FILTER_MODES

```typescript
FILTER_MODES: Readonly<{ 
    BACKGROUND: 0; 
    COLORATION: 2; 
    ILLUMINATION: 1 
}> = ...
```

Masking modes.

---

### fragmentCore

```typescript
fragmentCore: string = ...
```

The fragment core code.

---

### fragmentHeader

```typescript
fragmentHeader: string = ...
```

Memory allocations and headers for the VisualEffectsMaskingFilter.

**Returns**  
The filter header according to the filter mode.

---

### POST_PROCESS_TECHNIQUES

```typescript
POST_PROCESS_TECHNIQUES: {
    CONTRAST: { glsl: string; id: string; };
    EXPOSURE: { glsl: string; id: string; };
    SATURATION: { glsl: string; id: string; };
} = ...
```

Filter post-process techniques.

---

### vertexShader

```typescript
vertexShader: string = ...
```

The default vertex shader used by all instances of AbstractBaseMaskFilter.  
Inherited from [AbstractBaseMaskFilter.vertexShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#vertexshader)

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

**Returns**: *void*  
Overrides [AbstractBaseMaskFilter.apply](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#apply)

---

### reset

```typescript
reset(): void
```

Remove all post-processing modes and reset some key uniforms.

**Returns**: *void*

---

### updatePostprocessModes

```typescript
updatePostprocessModes(postProcessModes?: string[], uniforms?: object): void
```

Update the filter shader with new post-process modes.

**Parameters**

- **postProcessModes**: *string[] = []* (Optional)  
  New modes to apply.

- **uniforms**: *object = {}* (Optional)  
  Uniforms value to update.

**Returns**: *void*

---

### create

```typescript
static create(__namedParameters?: {}): VisualEffectsMaskingFilter
```

**Parameters**

- **__namedParameters**: *{} = {}*

**Returns**: *VisualEffectsMaskingFilter*  
Overrides [AbstractBaseMaskFilter.create](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#create)

---

### fragmentPostProcess

```typescript
static fragmentPostProcess(postProcessModes?: string[]): string
```

Construct filter post-processing code according to provided value.

**Parameters**

- **postProcessModes**: *string[] = []*  
  Post-process modes to construct techniques.

**Returns**: *string*  
The constructed shader code for post-process techniques.

---

### fragmentShader

```typescript
static fragmentShader(postProcessModes?: string[]): string
```

Specify the fragment shader to use according to mode.

**Parameters**

- **postProcessModes**: *string[] = []*

**Returns**: *string*  
Overrides [AbstractBaseMaskFilter.fragmentShader](https://foundryvtt.com/api/classes/foundry.canvas.rendering.filters.AbstractBaseMaskFilter.html#fragmentshader)