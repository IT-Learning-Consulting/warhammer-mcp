# createMultiSelectInput | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
createMultiSelectInput(
    config: FormInputConfig<(string | number)[]> & Omit<
        SelectInputConfig,
        "blank"
    >,
): AbstractMultiSelectElement
```

Create a `<multi-select>` or `<multi-checkbox>` element for fields supporting multiple choices.

### Parameters

- **config**: `FormInputConfig<(string | number)[]> & Omit<SelectInputConfig, "blank">`  
  Configuration object for creating the multi-select element. The `value` property accepts an array of strings or numbers corresponding to the selected choices.

### Returns

- `AbstractMultiSelectElement`


[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)