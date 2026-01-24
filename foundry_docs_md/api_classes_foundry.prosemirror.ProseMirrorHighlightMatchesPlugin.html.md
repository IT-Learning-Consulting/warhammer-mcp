# ProseMirrorHighlightMatchesPlugin

A ProseMirrorPlugin wrapper around the PossibleMatchesTooltip class.

## Hierarchy

- [ProseMirrorPlugin](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html)
- **ProseMirrorHighlightMatchesPlugin**

---

## Constructors

### constructor

```typescript
new ProseMirrorHighlightMatchesPlugin(
    schema: Schema,
    options?: any,
): ProseMirrorHighlightMatchesPlugin
```

**Parameters**

- **schema**: *Schema*  
  The ProseMirror schema.

- **options**: *any* = {} (Optional)  
  Additional options to configure the plugin's behaviour.

**Returns**

*ProseMirrorHighlightMatchesPlugin*

Overrides [ProseMirrorPlugin.constructor](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#constructor)

---

## Methods

### Static build

```typescript
build(schema: any, options?: {}): Plugin<any>
```

Build the plugin.

**Parameters**

- **schema**: *any*  
  The ProseMirror schema to build the plugin against.

- **options**: *{}* = {} (Optional)  
  Additional options to pass to the plugin.

**Returns**

*Plugin<any>*

Overrides [ProseMirrorPlugin.build](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#build)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)