# ImageHelper

A helper class to provide common functionality for working with Image objects.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

---

## Static Methods

### canvasToBase64

```typescript
canvasToBase64(
    canvas: HTMLCanvasElement,
    type?: string,
    quality?: number,
): Promise<string>
```

Asynchronously convert a canvas element to base64.

**Parameters**

- **canvas**: `HTMLCanvasElement`  
- **type** _(optional)_: `string`  
- **quality** _(optional)_: `number`  

**Returns**  
`Promise<string>` — The base64 string of the canvas.

---

### compositeCanvasTexture

```typescript
compositeCanvasTexture(
    object: DisplayObject,
    options?: {
        center?: boolean;
        height?: number;
        tx?: number;
        ty?: number;
        width?: number;
    },
): Texture<Resource>
```

Composite a canvas object by rendering it to a single texture.

**Parameters**

- **object**: `DisplayObject`  
  The object to render to a texture.

- **options** _(optional)_:  
  An object to configure the resulting texture:

  - **center**?: `boolean`  
    Center the texture in the rendered frame?

  - **height**?: `number`  
    The desired height of the output texture.

  - **tx**?: `number`  
    A horizontal translation to apply to the object.

  - **ty**?: `number`  
    A vertical translation to apply to the object.

  - **width**?: `number`  
    The desired width of the output texture.

**Returns**  
`Texture<Resource>` — The composite Texture object.

---

### createThumbnail

```typescript
createThumbnail(
    src: string | DisplayObject,
    options: {
        center?: boolean;
        format?: string;
        height?: number;
        quality?: number;
        tx?: number;
        ty?: number;
        width?: number;
    },
): Promise<object>
```

Create thumbnail preview for a provided image path.

**Parameters**

- **src**: `string | DisplayObject`  
  The URL or display object of the texture to render to a thumbnail.

- **options**:  
  Additional named options passed to the `compositeCanvasTexture` function:

  - **center**?: `boolean`  
    Whether to center the object within the thumbnail.

  - **format**?: `string`  
    The desired output image format.

  - **height**?: `number`  
    The desired height of the resulting thumbnail.

  - **quality**?: `number`  
    The desired output image quality.

  - **tx**?: `number`  
    A horizontal transformation to apply to the provided source.

  - **ty**?: `number`  
    A vertical transformation to apply to the provided source.

  - **width**?: `number`  
    The desired width of the resulting thumbnail.

**Returns**  
`Promise<object>` — The parsed and converted thumbnail data.

---

### hasImageExtension

```typescript
hasImageExtension(src: string): boolean
```

Test whether a source file has a supported image extension type.

**Parameters**

- **src**: `string`  
  A requested image source path.

**Returns**  
`boolean` — Does the filename end with a valid image extension?

---

### pixelsToCanvas

```typescript
pixelsToCanvas(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    options?: {
        eh?: number;
        element?: HTMLCanvasElement;
        ew?: number;
    },
): HTMLCanvasElement
```

Create a canvas element containing the pixel data.

**Parameters**

- **pixels**: `Uint8ClampedArray`  
  Buffer used to create the image data.

- **width**: `number`  
  Buffered image width.

- **height**: `number`  
  Buffered image height.

- **options** _(optional)_:  
  Options for configuring the canvas element:

  - **eh**?: `number`  
    Specified height for the element (default to buffer image height).

  - **element**?: `HTMLCanvasElement`  
    The element to use.

  - **ew**?: `number`  
    Specified width for the element (default to buffer image width).

**Returns**  
`HTMLCanvasElement`

---

### pixiToBase64

```typescript
pixiToBase64(
    target: DisplayObject,
    type: string,
    quality: number,
): Promise<string>
```

Asynchronously convert a DisplayObject container to base64 using `Canvas#toBlob` and `FileReader`.

**Parameters**

- **target**: `DisplayObject`  
  A PIXI display object to convert.

- **type**: `string`  
  The requested MIME type of the output, default is `image/png`.

- **quality**: `number`  
  A number between 0 and 1 for image quality if `image/jpeg` or `image/webp`.

**Returns**  
`Promise<string>` — A processed base64 string.

---

### textureToImage

```typescript
textureToImage(
    texture: Texture<Resource>,
    options?: {
        format?: string;
        quality?: number;
    },
): Promise<string>
```

Extract a texture to a base64 PNG string.

**Parameters**

- **texture**: `Texture<Resource>`  
  The texture object to extract.

- **options** _(optional)_:  
  Options for output format and quality:

  - **format**?: `string`  
    Image format, e.g. `"image/jpeg"` or `"image/webp"`.

  - **quality**?: `number`  
    JPEG or WEBP compression from 0 to 1. Default is 0.92.

**Returns**  
`Promise<string>` — A base64 PNG string of the texture.

---

### uploadBase64

```typescript
uploadBase64(
    base64: string,
    fileName: string,
    filePath: string,
    options?: {
        notify?: boolean;
        storage?: string;
        type?: string;
    },
): Promise<object>
```

Upload a base64 image string to a persisted data storage location.

**Parameters**

- **base64**: `string`  
  The base64 string.

- **fileName**: `string`  
  The file name to upload.

- **filePath**: `string`  
  The file path where the file should be uploaded.

- **options** _(optional)_:  
  Additional options which affect uploading:

  - **notify**?: `boolean`  
    Display a UI notification when the upload is processed.

  - **storage**?: `string`  
    The data storage location to which the file should be uploaded.

  - **type**?: `string`  
    The MIME type of the file being uploaded.

**Returns**  
`Promise<object>` — A promise which resolves to the FilePicker upload response.