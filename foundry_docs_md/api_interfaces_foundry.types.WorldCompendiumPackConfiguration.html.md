# WorldCompendiumPackConfiguration

Interface representing the configuration options for a world compendium pack in Foundry Virtual Tabletop.

```typescript
interface WorldCompendiumPackConfiguration {
  folder?: string;
  locked?: boolean;
  sort?: number;
}
```

## Properties

- **folder?**: `string`  
  Optional. The folder in which the compendium pack is organized.

- **locked?**: `boolean`  
  Optional. Indicates whether the compendium pack is locked.

- **sort?**: `number`  
  Optional. Specifies the sorting order of the compendium pack.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)