# FormInputConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface FormInputConfig<FormInputValue = unknown> {
  aria?: Record<string, string>;
  autofocus?: boolean;
  classes?: string;
  dataset?: Record<string, string>;
  disabled?: boolean;
  id?: string;
  input?: any;
  localize?: boolean;
  name: string;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  value?: FormInputValue;
}
```

## Type Parameters

- **FormInputValue** = *unknown*

## Properties

- **aria?**: `Record<string, string>`  
  Aria attributes to assign to the input.

- **autofocus?**: `boolean`  
  Is the field autofocused?

- **classes?**: `string`  
  Space-delimited class names to apply to the input.

- **dataset?**: `Record<string, string>`  
  Additional dataset attributes to assign to the input.

- **disabled?**: `boolean`  
  Is the field disabled?

- **id?**: `string`  
  An id to assign to the element.

- **input?**: `any`

- **localize?**: `boolean`  
  Localize values of this field?

- **name**: `string`  
  The name of the form element.

- **placeholder?**: `string`  
  A placeholder value, if supported by the element type.

- **readonly?**: `boolean`  
  Is the field readonly?

- **required?**: `boolean`  
  Is the field required?

- **value?**: `FormInputValue`  
  The current value of the form element.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)