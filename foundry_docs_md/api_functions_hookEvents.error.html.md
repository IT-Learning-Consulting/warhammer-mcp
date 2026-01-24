# error | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `error`

```typescript
error(location: string, error: Error, data: object): void
```

A hook event that fires whenever Foundry experiences an error.

#### Parameters

- **location**: *string*  
  The method where the error was caught.

- **error**: *Error*  
  The error.

- **data**: *object*  
  Additional data that might be provided, based on the nature of the error.

#### Returns

*void*

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)