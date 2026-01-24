# FormSelectOption | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface FormSelectOption {
  dataset?: Record<string, string>;
  disabled?: boolean;
  group?: string;
  label?: string;
  rule?: boolean;
  selected?: boolean;
  value?: string;
}
```

## Properties

- **dataset?**: `Record<string, string>`  
  Optional. A record of string key-value pairs representing dataset attributes.

- **disabled?**: `boolean`  
  Optional. Indicates if the option is disabled.

- **group?**: `string`  
  Optional. The group to which this option belongs.

- **label?**: `string`  
  Optional. The visible label text for this option.

- **rule?**: `boolean`  
  Optional. A boolean indicating a special rule for this option.

- **selected?**: `boolean`  
  Optional. Indicates if the option is selected.

- **value?**: `string`  
  Optional. The value associated with this option.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)