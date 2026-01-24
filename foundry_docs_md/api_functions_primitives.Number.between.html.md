# between | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `between`

```typescript
between(a: number, b: number, inclusive?: boolean): boolean
```

A faster numeric between check which avoids type coercion to the `Number` object. Since this avoids coercion, if non-numbers are passed in unpredictable results will occur. Use with caution.

**Parameters**

- **a**: `number`  
  The lower-bound

- **b**: `number`  
  The upper-bound

- **inclusive**: `boolean` = `true`  
  Include the bounding values as a true result?

**Returns** `boolean`  
Is the number between the two bounds?

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)