# MacroData

## Interface MacroData

```typescript
interface MacroData {
  _id: null | string;
  _stats: DocumentStats;
  author: string;
  command: string;
  flags: DocumentFlags;
  folder: null | string;
  img?: string;
  name: string;
  ownership?: object;
  scope?: string;
  sort?: number;
  type: string;
}
```

## Properties

### _id

**_id**: `null | string`  
The _id which uniquely identifies this Macro document.

### _stats

**_stats**: [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
An object of creation and access information.

### author

**author**: `string`  
The _id of a User document which created this Macro.

### command

**command**: `string`  
The string content of the macro command.

### flags

**flags**: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
An object of optional key/value flags.

### folder

**folder**: `null | string`  
The _id of a Folder which contains this Macro.

### img *(optional)*

**img?**: `string`  
An image file path which provides the thumbnail artwork for this Macro.

### name

**name**: `string`  
The name of this Macro.

### ownership *(optional)*

**ownership?**: `object`  
An object which configures ownership of this Macro.

### scope *(optional)*

**scope?**: `string`  
The scope of this Macro application from `CONST.MACRO_SCOPES`.

### sort *(optional)*

**sort?**: `number`  
The numeric sort value which orders this Macro relative to its siblings.

### type

**type**: `string`  
A Macro subtype from `CONST.MACRO_TYPES`.