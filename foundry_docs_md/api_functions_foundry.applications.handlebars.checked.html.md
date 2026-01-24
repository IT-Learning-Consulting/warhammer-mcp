# checked

```typescript
checked(value: unknown): string
```

For checkboxes, if the value of the checkbox is true, add the `"checked"` property, otherwise add nothing.

### Parameters

- **value**: `unknown`  
  A value with a truthiness indicative of whether the checkbox is checked

### Returns

- `string`

### Example

```html
<label>My Checkbox</label>
<input type="checkbox" name="myCheckbox" {{checked myCheckbox}}>
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)