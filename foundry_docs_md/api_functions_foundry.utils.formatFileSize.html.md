# formatFileSize

```typescript
formatFileSize(
    size: number,
    options?: { base?: 2 | 10; decimalPlaces?: number },
): string
```

Format a file size to an appropriate order of magnitude.

### Parameters

- **size**: `number`  
  The size in bytes.

- **options** (optional): `{ base?: 2 | 10; decimalPlaces?: number } = {}`  
  Optional settings object.

  - **base** (optional): `2 | 10`  
    The base to use. In base 10 a kilobyte is 1000 bytes. In base 2 it is 1024 bytes.

  - **decimalPlaces** (optional): `number`  
    The number of decimal places to round to.

### Returns

`string`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)