# TextureExtractor

A class or interface that provides support for WebGL async read pixel/texture data extraction.

---

## Constructor

```typescript
new TextureExtractor(
    renderer: Renderer,
    config?: {
        callerName?: string;
        controlHash?: boolean;
        debug?: boolean;
        format?: FORMATS;
    },
): TextureExtractor
```

**Parameters**

- **renderer**: `Renderer`  
  The renderer

- **config?**:  
  Worker initialization options (optional)
  - **callerName?**: `string`  
    The caller name
  - **controlHash?**: `boolean`  
    Should use control hash?
  - **debug?**: `boolean`  
    Enable debug log?
  - **format?**: `FORMATS`  
    The texture format

**Returns:** `TextureExtractor`

---

## Properties

### debug

```typescript
debug: boolean = false
```

Debug flag.

### COMPRESSION_MODES

```typescript
static COMPRESSION_MODES: { BASE64: number; NONE: number } = ...
```

List of compression modes that could be applied with extraction.

---

## Accessors

### format

```typescript
get format(): FORMATS
```

The texture format on which the Texture Extractor must work.

**Returns:** `FORMATS`

### renderer

```typescript
get renderer(): Renderer
```

The WebGL2 renderer.

**Returns:** `Renderer`

### type

```typescript
get type(): TYPES
```

The texture type on which the Texture Extractor must work.

**Returns:** `TYPES`

---

## Methods

### contextChange

```typescript
contextChange(): void
```

Called by the renderer contextChange runner.

**Returns:** `void`

### destroy

```typescript
destroy(): void
```

Destroy this TextureExtractor.

**Returns:** `void`

### extract

Extract methods are overloaded to support different extraction options:

```typescript
extract(
    options: TexturePixelsExtractionOptions,
): Promise<{
    height: number;
    out?: ArrayBuffer;
    pixels: undefined | Uint8ClampedArray;
    width: number;
}>
```

Extract a rectangular block of pixels from the texture (without un-pre-multiplying).

**Parameters**

- **options**: [`TexturePixelsExtractionOptions`](https://foundryvtt.com/api/interfaces/foundry.TexturePixelsExtractionOptions.html)  
  Options which configure pixels extraction behavior

**Returns:** `Promise` resolving to an object containing:

- **height**: `number`
- **out?**: `ArrayBuffer`
- **pixels**: `undefined | Uint8ClampedArray`
- **width**: `number`

The pixels or `undefined` if there's no change compared to the last time pixels were extracted and the control hash option is enabled.  
If an output buffer was passed, the (new) output buffer is included in the result, which may be different from the output buffer that was passed because it was detached.

```typescript
extract(
    options: TextureBase64ExtractionOptions,
): Promise<undefined | string>
```

Extract base64 string from the texture.

**Parameters**

- **options**: [`TextureBase64ExtractionOptions`](https://foundryvtt.com/api/interfaces/foundry.TextureBase64ExtractionOptions.html)  
  Options which configure base64 extraction behavior

**Returns:** `Promise` resolving to a base64 string or `undefined` if there's no change compared to the last time base64 was extracted and the control hash option is enabled.

### reset

```typescript
reset(): void
```

Free all the bound objects.

**Returns:** `void`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)