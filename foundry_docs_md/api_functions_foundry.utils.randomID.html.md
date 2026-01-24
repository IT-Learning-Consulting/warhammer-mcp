# randomID | Foundry Virtual Tabletop - API Documentation - Version 13

### Function randomID

```typescript
randomID(length?: number): string
```

Generate a random alphanumeric string ID of a given requested length using `crypto.getRandomValues()`.

**Parameters**

- **length**: *number* = 16  
  The length of the random string to generate, which must be at most 16384.

**Returns**  
*string*  
A string containing random letters (A-Z, a-z) and numbers (0-9).

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)