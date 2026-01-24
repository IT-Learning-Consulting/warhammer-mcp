# ProseMirrorPasteTransformer

A class responsible for applying transformations to content pasted inside the editor.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.prosemirror.ProseMirrorPasteTransformer)  
- *ProseMirrorPlugin*  
- **ProseMirrorPasteTransformer**

---

## Constructors

### constructor

```typescript
new ProseMirrorPasteTransformer(schema: Schema): ProseMirrorPasteTransformer
```

An abstract class for building a ProseMirror Plugin.

**Parameters**

- **schema**: *Schema*  
  The schema to build the plugin against.

**Returns**  
*ProseMirrorPasteTransformer*

**See**  
Inherited from [ProseMirrorPlugin.constructor](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#constructor)

---

## Methods

### Static build

```typescript
build(schema: any, options?: {}): Plugin<any>
```

**Parameters**

- **schema**: *any*  
- **options**: *{}* = {}

**Returns**  
*Plugin<any>*

Overrides [ProseMirrorPlugin.build](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#build)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)