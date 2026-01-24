# ProseMirrorPlugin | Foundry Virtual Tabletop - API Documentation - Version 13

## Class ProseMirrorPlugin (Abstract)

An abstract class for building a ProseMirror Plugin.

### Constructors

```typescript
new ProseMirrorPlugin(schema: Schema): ProseMirrorPlugin
```

- **schema**: *Schema*  
  The schema to build the plugin against.

### Methods

#### build (static, abstract)

```typescript
build(schema: Schema, options?: object): Plugin
```

Build the plugin.

- **schema**: *Schema*  
  The ProseMirror schema to build the plugin against.

- **options** *(optional)*: *object* = {}  
  Additional options to pass to the plugin.

**Returns:** *Plugin*

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)