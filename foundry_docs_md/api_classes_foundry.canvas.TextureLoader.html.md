# TextureLoader

A Loader class which helps with loading video and image textures.

## Properties

### CACHE_TTL

```typescript
CACHE_TTL: number = ...
```

The duration in milliseconds for which a texture will remain cached.

---

### loader

```typescript
loader: TextureLoader
```

A global reference to the singleton texture loader.

---

## Accessors

### approximateTotalMemoryUsage

```typescript
get approximateTotalMemoryUsage(): number
```

A public getter to expose the total approximate memory usage.

**Returns:** `number`  
The total usage in bytes.

---

## Methods

### expireCache

```typescript
expireCache(options?: { exclude?: Set<string> }): Promise<void>
```

Expire and unload assets from the cache which have not been used for more than `CACHE_TTL` milliseconds.

**Parameters:**

- **options?**: _object_ (optional)  
  - **exclude?**: `Set<string>` (optional)  
    A set of source URLs to _skip_ from eviction checks.

**Returns:** `Promise<void>`

---

### getCache

```typescript
getCache(
    src: string,
): null | Spritesheet<ISpritesheetData> | BaseTexture<Resource, IAutoDetectOptions>
```

Retrieve a texture or a sprite sheet from the assets cache.

**Parameters:**

- **src**: `string`  
  The source URL.

**Returns:**  
`null` | `Spritesheet<ISpritesheetData>` | `BaseTexture<Resource, IAutoDetectOptions>`  
The cached texture, a sprite sheet or undefined.

---

### load

```typescript
load(
    sources: string[],
    options?: {
        clean?: string;
        displayProgress?: boolean;
        escape?: string;
        expireCache?: boolean;
        format?: string;
        localize?: string;
        maxConcurrent?: number;
        message?: string;
    },
): Promise<void>[]
```

Load an Array of provided source URL paths. Paths which begin with a special character "#" are ignored as texture references.

**Parameters:**

- **sources**: `string[]`  
  The source URLs to load.

- **options?** (optional):  
  - **clean?**: `string`  
    Whether to clean the provided message string as untrusted user input. No cleaning is applied if `format` is passed and `escape` is true or `localize` is true and `format` is not passed.
  - **displayProgress?**: `boolean`  
    Display loading progress bar.
  - **escape?**: `string`  
    Whether to escape the values of `format`.
  - **expireCache?**: `boolean`  
    Expire other cached textures?
  - **format?**: `string`  
    A mapping of formatting strings passed to Localization#format.
  - **localize?**: `string`  
    Whether to localize the message content before displaying it.
  - **maxConcurrent?**: `number`  
    The maximum number of textures that can be loaded concurrently.
  - **message?**: `string`  
    The status message to display in the load bar.

**Returns:** `Promise<void>[]`  
A Promise which resolves once all textures are loaded.

---

### loadTexture

```typescript
loadTexture(
    src: string,
): Promise<null | Spritesheet<ISpritesheetData> | BaseTexture<Resource, IAutoDetectOptions>>
```

Load a single texture or spritesheet on-demand from a given source URL path.

**Parameters:**

- **src**: `string`  
  The source texture path to load.

**Returns:**  
`Promise<null | Spritesheet<ISpritesheetData> | BaseTexture<Resource, IAutoDetectOptions>>`  
The loaded texture object.

---

### setCache

```typescript
setCache(
    src: string,
    asset: Spritesheet<ISpritesheetData> | BaseTexture<Resource, IAutoDetectOptions>,
): void
```

Add an image or a sprite sheet URL to the assets cache. Include an approximate memory size in the stored data.

**Parameters:**

- **src**: `string`  
  The source URL.
- **asset**: `Spritesheet<ISpritesheetData> | BaseTexture<Resource, IAutoDetectOptions>`  
  The asset.

**Returns:** `void`

---

### fetchResource

```typescript
static fetchResource(src: string, options?: { bustCache?: boolean }): Promise<Blob>
```

Use the Fetch API to retrieve a resource and return a Blob instance for it.

**Parameters:**

- **src**: `string`  
  The source URL.
- **options?** (optional):  
  - **bustCache?**: `boolean`  
    Append a cache-busting query parameter to the request.

**Returns:** `Promise<Blob>`  
A Blob containing the loaded data.

---

### getCacheBustURL

```typescript
static getCacheBustURL(src: string): string | boolean
```

Return a URL with a cache-busting query parameter appended.

**Parameters:**

- **src**: `string`  
  The source URL being attempted.

**Returns:** `string | boolean`  
The new URL, or false on a failure.

---

### getTextureAlphaData

```typescript
static getTextureAlphaData(
    texture: Texture<Resource>,
    resolution?: number,
): undefined | TextureAlphaData
```

Use the texture to create a cached mapping of pixel alpha and cache it. Cache the bounding box of non-transparent pixels for the un-rotated shape.

**Parameters:**

- **texture**: `Texture<Resource>`  
  The provided texture.
- **resolution?**: `number` = 1 (optional)  
  Resolution of the texture data output.

**Returns:** `undefined | TextureAlphaData`  
The texture data if the texture is valid, else undefined.

---

### hasTextExtension

```typescript
static hasTextExtension(src: string): boolean
```

Check if a source has a text file extension.

**Parameters:**

- **src**: `string`  
  The source.

**Returns:** `boolean`  
If the source has a text extension or not.

---

### loadSceneTextures

```typescript
static loadSceneTextures(
    scene: Scene,
    options?: {
        additionalSources?: string[];
        expireCache?: boolean;
        maxConcurrent?: number;
    },
): Promise<void>
```

Load all the textures which are required for a particular Scene.

**Parameters:**

- **scene**: `Scene`  
  The Scene to load.
- **options?** (optional):  
  - **additionalSources?**: `string[]`  
    Additional sources to load during canvas initialize.
  - **expireCache?**: `boolean`  
    Destroy other expired textures.
  - **maxConcurrent?**: `number`  
    The maximum number of textures that can be loaded concurrently.

**Returns:** `Promise<void>`

---

### pinSource

```typescript
static pinSource(src: string): void
```

Pin a source URL so it cannot be evicted.

**Parameters:**

- **src**: `string`  
  The source URL to pin.

**Returns:** `void`

---

### unpinSource

```typescript
static unpinSource(src: string): void
```

Unpin a source URL that was previously pinned.

**Parameters:**

- **src**: `string`  
  The source URL to unpin.

**Returns:** `void`

---

For more information, refer to the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules/foundry.canvas.html#TextureLoader) and related classes.