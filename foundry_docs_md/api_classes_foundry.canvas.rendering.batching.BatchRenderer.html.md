# BatchRenderer

A batch renderer with a customizable data transfer function to packed geometries.

## Hierarchy

*BatchRenderer*

## Properties

### Protected

#### _packInterleavedGeometry

Type: `undefined | Function`  
The PackInterleavedGeometry function provided by the sampler.

#### _preRenderBatch

```typescript
_preRenderBatch: (batchRenderer: BatchRenderer) => undefined | void
```
The update function provided by the sampler and that is called just before a flush.

### Static

#### defaultUniforms

Type: `object | ((maxTextures: number) => object) = {}`  
The default uniform values for the batch shader.

#### shaderGeneratorClass

Type: `typeof BatchShaderGenerator = BatchShaderGenerator`  
The batch shader generator class.

### Accessors

#### uniforms

```typescript
get uniforms(): undefined | object
```
Get the uniforms bound to this abstract batch renderer.

**Returns:** `undefined | object`

### Protected

#### reservedTextureUnits

```typescript
get reservedTextureUnits(): number
```
Number of reserved texture units reserved by the batch shader that cannot be used by the  
batch renderer.

**Returns:** `number`

```typescript
set reservedTextureUnits(val: number): void
```
The number of reserved texture units that the shader generator should not use (maximum 4).

**Parameters:**

- **val**: `number`

**Returns:** `void`

## Methods

### contextChange

```typescript
contextChange(): void
```
This override allows to allocate a given number of texture units reserved for a custom  
batched shader. These reserved texture units won't be used to batch textures for PIXI.Sprite  
or SpriteMesh.

**Returns:** `void`

### onPrerender

```typescript
onPrerender(): void
```

**Returns:** `void`

### packInterleavedGeometry

```typescript
packInterleavedGeometry(
    element: any,
    attributeBuffer: any,
    indexBuffer: any,
    aIndex: any,
    iIndex: any,
): void
```

**Parameters:**

- **element**: `any`
- **attributeBuffer**: `any`
- **indexBuffer**: `any`
- **aIndex**: `any`
- **iIndex**: `any`

**Returns:** `void`

### setShaderGenerator

```typescript
setShaderGenerator(
    __namedParameters?: { fragment?: any; uniforms?: any; vertex?: any },
): void
```

**Parameters:**

- **__namedParameters**: `{ fragment?: any; uniforms?: any; vertex?: any } = {}`

**Returns:** `void`

### start

```typescript
start(): void
```

**Returns:** `void`

### Static: hasPlugin

```typescript
hasPlugin(name: string): boolean
```
Verify if a PIXI plugin exists. Check by name.

**Parameters:**

- **name**: `string`  
  The name of the pixi plugin to check.

**Returns:** `boolean`  
True if the plugin exists, false otherwise.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)