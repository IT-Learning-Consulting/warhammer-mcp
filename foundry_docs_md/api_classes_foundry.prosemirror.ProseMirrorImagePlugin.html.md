# ProseMirrorImagePlugin

A class responsible for handling drag-and-drop and pasting of image content. Ensures no base64 data is injected directly into the journal content and it is instead uploaded to the user's data directory.

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.prosemirror.ProseMirrorImagePlugin), Expand)  
* _ProseMirrorPlugin_  
* **ProseMirrorImagePlugin**

---

## Constructors

### constructor

```typescript
new ProseMirrorImagePlugin(
    schema: Schema,
    options?: { document: ClientDocument },
): ProseMirrorImagePlugin
```

**Parameters**

- **schema**: `Schema`  
  The ProseMirror schema.

- **options**: `{ document: ClientDocument } = {}` (optional)  
  Additional options to configure the plugin's behaviour.

  - **document**: `ClientDocument`  
    A related Document to store extracted base64 images for.

**Returns**: `ProseMirrorImagePlugin`  

Overrides [ProseMirrorPlugin.constructor](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#constructor)  

---

## Methods

### _extractBase64Images

```typescript
protected _extractBase64Images(html: string): [full: string, mime: string, data: string][]
```

Protected method that detects base64 image data embedded in an HTML string and extracts it.

**Parameters**

- **html**: `string`  
  The HTML data as a string.

**Returns**  
An array of tuples, each containing: 
- `full`: `string` - The full matched base64 image string
- `mime`: `string` - The MIME type of the image
- `data`: `string` - The base64 data string

---

### _onDrop

```typescript
protected _onDrop(
    view: EditorView,
    event: DragEvent,
    slice: Slice,
    moved: boolean,
): undefined | true
```

Protected method to handle a drop onto the editor.

**Parameters**

- **view**: `EditorView`  
  The ProseMirror editor view.

- **event**: `DragEvent`  
  The drop event.

- **slice**: `Slice`  
  A slice of editor content.

- **moved**: `boolean`  
  Whether the slice has been moved from a different part of the editor.

**Returns**  
`undefined` or `true`

---

### _onPaste

```typescript
protected _onPaste(view: EditorView, event: ClipboardEvent): undefined | true
```

Protected method to handle a paste into the editor.

**Parameters**

- **view**: `EditorView`  
  The ProseMirror editor view.

- **event**: `ClipboardEvent`  
  The paste event.

**Returns**  
`undefined` or `true`

---

### _replaceBase64Images

```typescript
protected _replaceBase64Images(
    view: EditorView,
    html: string,
    images: [full: string, mime: string, data: string][],
): Promise<void>
```

Protected method that captures any base64-encoded images embedded in the rich text paste and uploads them.

**Parameters**

- **view**: `EditorView`  
  The ProseMirror editor view.

- **html**: `string`  
  The HTML data as a string.

- **images**: `[full: string, mime: string, data: string][]`  
  An array of extracted base64 image data.

**Returns**  
`Promise<void>`

---

### _uploadImages

```typescript
protected _uploadImages(
    view: EditorView,
    files: FileList,
    pos?: number,
): Promise<void>
```

Protected method to upload any image files encountered in the drop.

**Parameters**

- **view**: `EditorView`  
  The ProseMirror editor view.

- **files**: `FileList`  
  The files to upload.

- **pos**: `number` (optional)  
  The position in the document to insert at. If not provided, the current selection will be replaced instead.

**Returns**  
`Promise<void>`

---

### static base64ToFile

```typescript
static base64ToFile(data: string, filename: string, mimetype: string): File
```

Converts a base64 string into a File object.

**Parameters**

- **data**: `string`  
  Base64 encoded data.

- **filename**: `string`  
  The filename.

- **mimetype**: `string`  
  The file's mimetype.

**Returns**  
`File`

---

### static build

```typescript
static build(schema: any, options?: {}): Plugin<any>
```

Build the plugin.

**Parameters**

- **schema**: `any`  
  The ProseMirror schema to build the plugin against.

- **options**: `{}` (optional)  
  Additional options to pass to the plugin.

**Returns**  
`Plugin<any>`

Overrides [ProseMirrorPlugin.build](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#build)