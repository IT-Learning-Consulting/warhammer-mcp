# prepareSelectOptionGroups | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
prepareSelectOptionGroups(
    config: FormInputConfig & SelectInputConfig,
): { group: string; options: FormSelectOption[] }[]
```

Structure a provided array of select options into a standardized format for rendering `optgroup` and option elements.

## Parameters

- **config**: `FormInputConfig & SelectInputConfig`

## Returns

An array of objects:

- **group**: `string`
- **options**: `FormSelectOption[]`

## Example

```typescript
const options = [
  {value: "bar", label: "Bar", selected: true, group: "Good Options"},
  {value: "foo", label: "Foo", disabled: true, group: "Bad Options"},
  {value: "baz", label: "Baz", group: "Good Options"}
];

const groups = ["Good Options", "Bad Options", "Unused Options"];

const optgroups = foundry.applications.fields.prepareSelectOptionGroups({
  options,
  groups,
  blank: true,
  sort: true
});
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)