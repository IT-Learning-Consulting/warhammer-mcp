# NotificationOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface NotificationOptions {
    clean?: boolean;
    console?: boolean;
    escape?: boolean;
    format?: Record<string, string>;
    localize?: boolean;
    permanent?: boolean;
    progress?: boolean;
}
```

## Properties

### clean?  
**Type:** `boolean`  
Whether to clean the provided message string as untrusted user input. No cleaning is applied if `format` is passed and `escape` is true or `localize` is true and `format` is not passed.

### console?  
**Type:** `boolean`  
Whether to log the message to the console.

### escape?  
**Type:** `boolean`  
Whether to escape the values of `format`.

### format?  
**Type:** `Record<string, string>`  
A mapping of formatting strings passed to [Localization#format](https://foundryvtt.com/api/modules.html).

### localize?  
**Type:** `boolean`  
Whether to localize the message content before displaying it.

### permanent?  
**Type:** `boolean`  
Should the notification be permanently displayed until dismissed.

### progress?  
**Type:** `boolean`  
Does this Notification include a progress bar?

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)