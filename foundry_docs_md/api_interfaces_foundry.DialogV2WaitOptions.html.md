# DialogV2WaitOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DialogV2WaitOptions {
    close?: DialogV2CloseCallback;
    rejectClose?: boolean;
    render?: DialogV2RenderCallback;
}
```

## Properties

### close?  
- **Type:** [DialogV2CloseCallback](https://foundryvtt.com/api/types/foundry.DialogV2CloseCallback.html)  
A synchronous function to invoke when the dialog is closed under any circumstances.

### rejectClose?  
- **Type:** `boolean`  
Throw a Promise rejection if the dialog is dismissed.

### render?  
- **Type:** [DialogV2RenderCallback](https://foundryvtt.com/api/types/foundry.DialogV2RenderCallback.html)  
A synchronous function to invoke whenever the dialog is rendered.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)