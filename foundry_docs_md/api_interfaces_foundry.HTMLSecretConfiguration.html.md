# HTMLSecretConfiguration | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface HTMLSecretConfiguration {
    callbacks: {
        content: HTMLSecretContentCallback;
        update: HTMLSecretUpdateCallback;
    };
    parentSelector: string;
}
```

## Properties

### callbacks

- **callbacks**:  
  ```typescript
  {
      content: HTMLSecretContentCallback;
      update: HTMLSecretUpdateCallback;
  }
  ```
  
  An object of callback functions for each operation.

### parentSelector

- **parentSelector**: `string`  
  The CSS selector used to target content that contains secret blocks.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)