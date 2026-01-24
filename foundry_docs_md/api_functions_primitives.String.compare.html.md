# compare

```typescript
compare(other: string): number
```

Compare this string (`x`) with the other string (`y`) by comparing each character's Unicode code point value. Returns a negative number if `x < y`, a positive number if `x > y`, or zero otherwise. This is the same comparison function used by `Array#sort` if the compare function argument is omitted. The result is host/locale-independent.

**Parameters**

- **other**: `string`  
  The other string to compare this string to.

**Returns**

`number`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)