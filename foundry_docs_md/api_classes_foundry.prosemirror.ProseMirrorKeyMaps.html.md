# ProseMirrorKeyMaps | Foundry Virtual Tabletop - API Documentation - Version 13

A class responsible for building the keyboard commands for the ProseMirror editor.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.prosemirror.ProseMirrorKeyMaps), Expand

- *ProseMirrorPlugin*
- **ProseMirrorKeyMaps**

## Constructors

### constructor

```typescript
new ProseMirrorKeyMaps(
    schema: Schema,
    options?: { onSave?: Function },
): ProseMirrorKeyMaps
```

**Parameters**

- **schema**: *Schema*  
  The ProseMirror schema to build keymaps for.

- **options?**: `{ onSave?: Function } = {}` (Optional)  
  Additional options to configure the plugin's behaviour.

    - **onSave?**: *Function* (Optional)

## Methods

### constructor

A function to call when Ctrl+S is pressed.

**Returns**  
*ProseMirrorKeyMaps*

Overrides [ProseMirrorPlugin.constructor](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#constructor)

---

### buildMapping

```typescript
buildMapping(): Record<string, ProseMirrorCommand>
```

Build keyboard commands for nodes and marks present in the schema.

**Returns**  
*Record<string, ProseMirrorCommand>*  
An object of keyboard shortcuts to editor functions.

---

### build (Static)

```typescript
build(schema: any, options?: {}): Plugin<any>
```

Build the plugin.

**Parameters**

- **schema**: *any*  
  The ProseMirror schema to build the plugin against.

- **options?**: `{}` (Optional)  
  Additional options to pass to the plugin.

**Returns**  
*Plugin<any>*

Overrides [ProseMirrorPlugin.build](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#build)