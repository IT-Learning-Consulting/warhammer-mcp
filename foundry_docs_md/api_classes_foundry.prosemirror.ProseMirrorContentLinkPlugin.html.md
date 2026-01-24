# ProseMirrorContentLinkPlugin

A class responsible for handling the dropping of Documents onto the editor and creating content links for them.

## Hierarchy

- [ProseMirrorPlugin](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html)
- **ProseMirrorContentLinkPlugin**

---

## Constructors

### constructor

```typescript
new ProseMirrorContentLinkPlugin(
    schema: Schema,
    options?: ProseMirrorContentLinkOptions,
): ProseMirrorContentLinkPlugin
```

**Parameters:**

- **schema**: *Schema*  
  The ProseMirror schema.

- **options**: *ProseMirrorContentLinkOptions* = {}  
  Additional options to configure the plugin's behaviour.

**Returns:**  
*ProseMirrorContentLinkPlugin*

---

## Methods

Overrides [ProseMirrorPlugin.constructor](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#constructor)

### _onDrop

```typescript
protected _onDrop(
    view: EditorView,
    event: DragEvent,
    slice: Slice,
    moved: boolean,
): undefined | true
```

Protected  
Handle a drop onto the editor.

**Parameters:**

- **view**: *EditorView*  
  The ProseMirror editor view.

- **event**: *DragEvent*  
  The drop event.

- **slice**: *Slice*  
  A slice of editor content.

- **moved**: *boolean*  
  Whether the slice has been moved from a different part of the editor.

**Returns:**  
*undefined* | *true*

---

### build

```typescript
static build(schema: any, options?: {}): Plugin<any>
```

Build the plugin.

**Parameters:**

- **schema**: *any*  
  The ProseMirror schema to build the plugin against.

- **options**: *{}* = {}  
  Additional options to pass to the plugin.

**Returns:**  
*Plugin<any>*

Overrides [ProseMirrorPlugin.build](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#build)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)