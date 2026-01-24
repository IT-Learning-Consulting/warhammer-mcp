# isNewerVersion

## Function isNewerVersion

```typescript
isNewerVersion(v1: string | number, v0: string | number): boolean
```

Return whether a target version (`v1`) is more advanced than some other reference version (`v0`). Supports either numeric or string version comparison with version parts separated by periods.

**Parameters**

- **v1**: `string | number`  
  The target version

- **v0**: `string | number`  
  The reference version

**Returns**  
`boolean`  
Is `v1` a more advanced version than `v0`?

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)