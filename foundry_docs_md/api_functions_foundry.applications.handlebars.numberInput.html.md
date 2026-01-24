# numberInput | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `numberInput`

```typescript
numberInput(value: number, options: any): SafeString
```

Render a form input field of type number with value appropriately rounded to step size.

**Parameters**

- **value**: `number`
- **options**: `any`

**Returns**

`SafeString`

**Example**

```handlebars
{{numberInput value name="numberField" step=1 min=0 max=10}}
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)