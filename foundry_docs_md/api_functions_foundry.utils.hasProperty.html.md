# hasProperty | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
hasProperty(object: object, key: string): boolean
```

A helper function which tests whether an object has a property or nested property given a string key. The method also supports arrays if the provided key is an integer index of the array. The string key supports the notation `a.b.c` which would return true if `object[a][b][c]` exists.

**Parameters**

- **object**: *object*  
  The object to traverse

- **key**: *string*  
  An object property with notation `a.b.c`

**Returns** *boolean*  
An indicator for whether the property exists

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)