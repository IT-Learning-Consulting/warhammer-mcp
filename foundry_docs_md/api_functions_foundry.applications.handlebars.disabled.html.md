# disabled | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `disabled`

```typescript
disabled(value: unknown): string
```

For use in form inputs. If the supplied value is truthy, add the `"disabled"` property, otherwise add nothing.

**Parameters**

- **value**: `unknown`  
  A value with a truthiness indicative of whether the input is disabled

**Returns**  
`string`

**Example**

```handlebars
<button type="submit" {{disabled myValue}}>Submit</button>
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)