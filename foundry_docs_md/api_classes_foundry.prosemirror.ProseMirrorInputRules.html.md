# ProseMirrorInputRules | Foundry Virtual Tabletop - API Documentation - Version 13

A class responsible for building the input rules for the ProseMirror editor.

## Hierarchy
- *ProseMirrorPlugin*
- **ProseMirrorInputRules**

## Constructors

### constructor

```typescript
new ProseMirrorInputRules(schema: Schema): ProseMirrorInputRules
```

An abstract class for building a ProseMirror Plugin.

**Parameters**

- **schema**: *Schema*  
  The schema to build the plugin against.

**Returns**  
*ProseMirrorInputRules*

**See**  
Inherited from [ProseMirrorPlugin](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html).constructor

## Methods

### buildRules

```typescript
buildRules(): InputRule[]
```

Build input rules for node types present in the schema.

**Returns**  
*InputRule[]*

### build (static)

```typescript
build(
    schema: Schema,
    options?: { minHeadingLevel?: number },
): Plugin<PluginState>
```

Build the plugin.

**Parameters**

- **schema**: *Schema*  
  The ProseMirror schema to build the plugin against.

- **options** (optional): `{ minHeadingLevel?: number } = {}`  
  Additional options to pass to the plugin.

  - **minHeadingLevel**?: *number*  
    The minimum heading level to start from when generating heading input rules. The resulting heading level for a heading rule is equal to the number of leading hashes minus this number.

**Returns**  
*Plugin<PluginState>*

Overrides [ProseMirrorPlugin.build](https://foundryvtt.com/api/classes/foundry.prosemirror.ProseMirrorPlugin.html#build)