# PackageLanguageData

```typescript
interface PackageLanguageData {
    lang: string;
    module?: string;
    name: string;
    path: string;
    system?: string;
}
```

## Properties

- **lang**: `string`  
  A string language code which is validated by `Intl.getCanonicalLocales`.

- **module** *(optional)*: `string`  
  Only apply this set of translations when a specific module is active.

- **name**: `string`  
  The human-readable language name.

- **path**: `string`  
  The relative path to included JSON translation strings.

- **system** *(optional)*: `string`  
  Only apply this set of translations when a specific system is being used.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)