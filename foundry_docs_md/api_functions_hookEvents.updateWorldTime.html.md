# updateWorldTime

**Foundry Virtual Tabletop - API Documentation - Version 13**

### Function updateWorldTime

```typescript
updateWorldTime(
    worldTime: number,
    dt: number,
    options: object,
    userId: string,
): void
```

A hook event that fires when the official World time is changed.

**Parameters**

- **worldTime**: *number*  
  The new canonical World time.

- **dt**: *number*  
  The delta.

- **options**: *object*  
  Options passed from the requesting client where the change was made.

- **userId**: *string*  
  The ID of the User who advanced the time.

**Returns**: *void*

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)