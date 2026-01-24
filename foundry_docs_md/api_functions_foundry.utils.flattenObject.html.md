# flattenObject | Foundry Virtual Tabletop - API Documentation - Version 13

### Function flattenObject

```typescript
flattenObject(obj: object, _d?: number): object
```

Flatten a possibly multidimensional object to a one-dimensional one by converting all nested keys to dot notation

**Parameters**

- **obj**: `object`  
  The object to flatten

- **_d**: `number` = 0 *(Optional)*  
  Track the recursion depth to prevent overflow

**Returns**  
`object`  
A flattened object

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)