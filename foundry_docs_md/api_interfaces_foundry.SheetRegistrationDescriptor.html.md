# SheetRegistrationDescriptor | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface SheetRegistrationDescriptor {
    canBeDefault?: boolean;
    canConfigure?: boolean;
    documentClass: any;
    id: string;
    label?: string | (() => string);
    makeDefault?: boolean;
    sheetClass: typeof import("https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html").Application 
        | typeof import("https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html").ApplicationV2;
    themes?: null | Record<string, string>;
    types?: string[];
}
```

## Properties

### Optional

- **canBeDefault?**: `boolean`  
  Whether this sheet is available to be selected as a default sheet for all Documents of that type.

- **canConfigure?**: `boolean`  
  Whether this sheet appears in the sheet configuration UI for users.

- **label?**: `string | () => string`  
  A human-readable label for the sheet name, or a function that returns one. Will be localized.

- **makeDefault?**: `boolean`  
  Whether to make this sheet the default for the provided sub-types.

- **themes?**: `null | Record<string, string>`  
  An object of theme keys to labels that the sheet supports. If this option is not supplied, the sheet is assumed to support both light and dark themes. If `null` is supplied, it indicates that the sheet does not support theming.

- **types?**: `string[]`  
  An array of Document sub-types to register the sheet for.

### Required

- **documentClass**: `any`  
  The Document class to register a new sheet option for.

- **id**: `string`  
  The identifier of the sheet being registered.

- **sheetClass**:  
  `typeof [Application](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html).Application`  
  |  
  `typeof [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html).ApplicationV2`  
  An Application class used to render the sheet.

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).