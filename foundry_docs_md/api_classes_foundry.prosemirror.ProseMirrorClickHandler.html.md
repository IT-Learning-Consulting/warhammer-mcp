# ProseMirrorClickHandler | Foundry Virtual Tabletop - API Documentation - Version 13

A class responsible for managing click events inside a ProseMirror editor.

## Hierarchy
- [ProseMirrorPlugin](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html)
- **ProseMirrorClickHandler**

---

## Constructors

### `constructor`

```typescript
new ProseMirrorClickHandler(schema: Schema): ProseMirrorClickHandler
```

An abstract class for building a ProseMirror Plugin.

**Parameters**

- **schema**: `Schema`  
  The schema to build the plugin against.

**Returns**

- `ProseMirrorClickHandler`

**See**

Inherited from [ProseMirrorPlugin.constructor](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#constructor)

---

## Methods

### Protected

#### `_onClick`

```typescript
protected _onClick(
  view: EditorView,
  pos: number,
  node: Node,
  nodePos: number,
  event: PointerEvent,
  direct: boolean,
): boolean | void
```

Handle a click on the editor.

**Parameters**

- **view**: `EditorView`  
  The ProseMirror editor view.

- **pos**: `number`  
  The position in the ProseMirror document that the click occurred at.

- **node**: `Node`  
  The current ProseMirror Node that the click has bubbled to.

- **nodePos**: `number`  
  The position of the click within this Node.

- **event**: `PointerEvent`  
  The click event.

- **direct**: `boolean`  
  Whether this Node is the one that was directly clicked on.

**Returns**

- `boolean | void`  
  A return value of true indicates the event has been handled, it will not propagate to other plugins, and ProseMirror will call preventDefault on it.

---

### Static

#### `build`

```typescript
static build(schema: any, options?: {}): Plugin<any>
```

Overrides [ProseMirrorPlugin.build](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#build).

**Parameters**

- **schema**: `any`

- **options**: `{}` = `{}` (optional)

**Returns**

- `Plugin<any>`