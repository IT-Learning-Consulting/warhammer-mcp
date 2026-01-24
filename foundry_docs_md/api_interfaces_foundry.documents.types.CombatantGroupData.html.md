# CombatantGroupData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface CombatantGroupData {
    _id: null | string;
    _stats: DocumentStats;
    flags: DocumentFlags;
    img?: string;
    initiative?: number;
    name?: string;
    ownership?: object;
    system?: object;
    type: string;
}
```

## Properties

### _id

**_id**: `null | string`  
The _id which uniquely identifies this CombatantGroup embedded document.

### _stats

**_stats**: [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
An object of creation and access information.

### flags

**flags**: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
An object of optional key/value flags.

### img (Optional)

**img?**: `string`  
A customized image which replaces the inferred group image.

### initiative (Optional)

**initiative?**: `number`  
The initiative value that will be used for all group members.

### name (Optional)

**name?**: `string`  
A customized name which replaces the inferred group name.

### ownership (Optional)

**ownership?**: `object`  
An object which configures ownership of this group.

### system (Optional)

**system?**: `object`  
Game system data which is defined by system data models.

### type

**type**: `string`  
The type of this CombatantGroup.