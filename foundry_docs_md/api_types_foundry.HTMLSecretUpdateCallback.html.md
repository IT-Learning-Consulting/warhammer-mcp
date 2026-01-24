# HTMLSecretUpdateCallback | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
type HTMLSecretUpdateCallback = (
    secret: HTMLElement,
    content: string,
) => Promise<ClientDocument>;
```

## Parameters

- **secret**: `HTMLElement`  
  The secret element that is being manipulated.

- **content**: `string`  
  The content block containing the updated secret element.

## Returns

`Promise<ClientDocument>`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)