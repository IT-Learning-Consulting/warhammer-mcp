# ProseMirrorDirtyPlugin

A simple plugin that records the dirty state of the editor.

## Hierarchy

- [ProseMirrorPlugin](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html)  
- **ProseMirrorDirtyPlugin**

## Constructors

### constructor

```typescript
new ProseMirrorDirtyPlugin(schema: Schema): ProseMirrorDirtyPlugin
```

An abstract class for building a ProseMirror Plugin.

**Parameters**

- **schema**: `Schema`  
  The schema to build the plugin against.

**Returns**  
`ProseMirrorDirtyPlugin`

**See**  
Inherited from [ProseMirrorPlugin.constructor](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#constructor)

---

## Methods

### Static build

```typescript
build(schema: any, options?: {}): Plugin<boolean>
```

Build the plugin.

**Parameters**

- **schema**: `any`  
  The ProseMirror schema to build the plugin against.
- **options**: `{}` = `{}`  
  Additional options to pass to the plugin.

**Returns**  
`Plugin<boolean>`

Overrides [ProseMirrorPlugin.build](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#build)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)