# getType | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `getType`

```typescript
getType(variable: any): string
```

Learn the underlying data type of some variable. Supported identifiable types include:  
`undefined`, `null`, `number`, `string`, `boolean`, `function`, `Array`, `Set`, `Map`, `Promise`, `Error`,  
`HTMLElement` (client side only), `Object` (plain objects). If the type isn't identifiable, `Unknown` is returned.

#### Parameters

- **variable**: `any`  
  A provided variable

#### Returns

- `string`  
  The named type of the token

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)