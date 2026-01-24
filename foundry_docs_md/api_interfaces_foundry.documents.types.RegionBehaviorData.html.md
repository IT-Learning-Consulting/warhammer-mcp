# RegionBehaviorData

**Foundry Virtual Tabletop - API Documentation - Version 13**  

```typescript
interface RegionBehaviorData {
  _id: null | string;
  _stats: DocumentStats;
  disabled?: boolean;
  flags: DocumentFlags;
  name?: string;
  system?: object;
  type: string;
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this RegionBehavior document.

- **_stats**: [`DocumentStats`](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
  An object of creation and access information.

- **disabled** *(optional)*: `boolean`  
  Is the RegionBehavior currently disabled?

- **flags**: [`DocumentFlags`](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags.

- **name** *(optional)*: `string`  
  The name used to describe the RegionBehavior.

- **system** *(optional)*: `object`  
  The system data object which is defined by the system `template.json` model.

- **type**: `string`  
  A RegionBehavior subtype which configures the system data model applied.


[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)