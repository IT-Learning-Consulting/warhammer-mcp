# SettingData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface SettingData {
  _id: null | string;
  _stats: DocumentStats;
  key: string;
  user?: string;
  value: any;
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this Setting document.

- **_stats**: [DocumentStats](https://foundryvtt.com/api/interfaces/foundry.data.types.DocumentStats.html)  
  An object of creation and access information.

- **key**: `string`  
  The setting key, a composite of `{scope}.{name}`.

- **user?**: `string` (optional)  
  The ID of the user this Setting belongs to, if user-scoped.

- **value**: `any`  
  The setting value, which is serialized to JSON.