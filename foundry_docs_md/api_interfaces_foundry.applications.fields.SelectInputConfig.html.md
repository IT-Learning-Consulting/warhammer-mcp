# SelectInputConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface SelectInputConfig {
    blank?: string;
    groups?: string[];
    labelAttr?: string;
    localize?: boolean;
    options: FormSelectOption[];
    sort?: boolean;
    type?: "single" | "multi" | "checkboxes";
    valueAttr?: string;
}
```

## Properties

- **blank?**: `string`  
  An optional string to control the order and display of ungrouped options within select input groups.

- **groups?**: `string[]`  
  An option to control the order and display of optgroup elements. The order of strings defines the displayed order of optgroup elements. A blank string may be used to define the position of ungrouped options. If not defined, the order of groups corresponds to the order of options.

- **labelAttr?**: `string`  
  An alternative label key of the object passed to the `options` array.

- **localize?**: `boolean`  
  Localize value labels.

- **options**: [`FormSelectOption`](https://foundryvtt.com/api/interfaces/foundry.applications.fields.FormSelectOption.html)[]  
  The array of options for the select input.

- **sort?**: `boolean`  
  Sort options alphabetically by label within groups.

- **type?**: `"single"` | `"multi"` | `"checkboxes"`  
  Customize the type of select that is created.

- **valueAttr?**: `string`  
  An alternative value key of the object passed to the `options` array.


---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)