# PackageCompendiumData

```typescript
interface PackageCompendiumData {
    label: string;
    name: string;
    path: string;
    system?: string;
    type: string;
}
```

## Properties

- **label**: *string*  
  The human-readable compendium name

- **name**: *string*  
  The canonical compendium name. This should contain no spaces or special characters

- **path**: *string*  
  The local relative path to the compendium source directory. The filename should match the  
  `name` attribute

- **system**?: *string*  
  _(Optional)_  
  Denote that this compendium pack requires a specific game system to function properly

- **type**: *string*  
  The specific document type that is contained within this compendium pack

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).