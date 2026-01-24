# ActiveEffectData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ActiveEffectData {
    _id: null | string;
    changes: EffectChangeData[];
    description?: string;
    disabled?: boolean;
    duration?: EffectDurationData;
    flags: DocumentFlags;
    icon?: string;
    name: string;
    origin?: string;
    sort?: number;
    statuses?: Set<string>;
    system?: object;
    tint?: string;
    transfer?: boolean;
    type?: string;
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies the ActiveEffect within a parent Actor or Item.

- **changes**: [`EffectChangeData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectChangeData.html)[]  
  The array of EffectChangeData objects which the ActiveEffect applies.

- **description?**: `string` (optional)  
  The HTML text description for this ActiveEffect document.

- **disabled?**: `boolean` (optional)  
  Is this ActiveEffect currently disabled?

- **duration?**: [`EffectDurationData`](https://foundryvtt.com/api/interfaces/foundry.documents.types.EffectDurationData.html) (optional)  
  An EffectDurationData object which describes the duration of the ActiveEffect.

- **flags**: [`DocumentFlags`](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags.

- **icon?**: `string` (optional)  
  An icon image path used to depict the ActiveEffect.

- **name**: `string`  
  The name which describes the ActiveEffect.

- **origin?**: `string` (optional)  
  A UUID reference to the document from which this ActiveEffect originated.

- **sort?**: `number` (optional)  
  The sort value.

- **statuses?**: `Set<string>` (optional)  
  Special status IDs that pertain to this effect.

- **system?**: `object` (optional)  
  The system type data field.

- **tint?**: `string` (optional)  
  A color string which applies a tint to the ActiveEffect icon.

- **transfer?**: `boolean` (optional)  
  Does this ActiveEffect automatically transfer from an Item to an Actor?

- **type?**: `string` (optional)  
  The document type.

---

For more details, see the [ActiveEffectData API Documentation](https://foundryvtt.com/api/interfaces/foundry.documents.types.ActiveEffectData.html) and the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).