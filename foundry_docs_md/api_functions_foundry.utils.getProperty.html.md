# getProperty | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
getProperty(object: object, key: string): any
```

A helper function which searches through an object to retrieve a value by a string key. The method also supports arrays if the provided key is an integer index of the array. The string key supports the notation `a.b.c` which would return `object[a][b][c]`.

**Parameters**

- **object**: `object`  
  The object to traverse

- **key**: `string`  
  An object property with notation `a.b.c`

**Returns** `any`  
The value of the found property

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)