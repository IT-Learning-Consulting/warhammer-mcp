# SettingSubmenuConfig

A Client Setting Submenu

```typescript
interface SettingSubmenuConfig {
    hint: string;
    icon: string;
    label: string;
    name: string;
    restricted: boolean;
    type: typeof Application | typeof ApplicationV2;
}
```

## Properties

- **hint**: `string`  
  An additional human readable hint

- **icon**: `string`  
  The classname of an Icon to render

- **label**: `string`  
  The human readable label

- **name**: `string`  
  The human readable name

- **restricted**: `boolean`  
  If true, only a GM can edit this Setting

- **type**: `typeof [Application](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html) | typeof [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)`  
  The Application class to render

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)