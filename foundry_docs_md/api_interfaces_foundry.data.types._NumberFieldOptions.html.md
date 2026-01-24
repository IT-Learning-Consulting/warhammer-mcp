# _NumberFieldOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface _NumberFieldOptions {
    choices?: object | Function | number[];
    integer?: boolean;
    max?: number;
    min?: number;
    positive?: boolean;
    step?: number;
}
```

## Properties

### Optional

- **choices?**: `object | Function | number[]`  
  An array of values or an object of values/labels which represent allowed choices for the field.  
  A function may be provided which dynamically returns the array of choices.

- **integer?**: `boolean`  
  Must the number be an integer?

- **max?**: `number`  
  A maximum allowed value.

- **min?**: `number`  
  A minimum allowed value.

- **positive?**: `boolean`  
  Must the number be positive?

- **step?**: `number`  
  A permitted step size.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)