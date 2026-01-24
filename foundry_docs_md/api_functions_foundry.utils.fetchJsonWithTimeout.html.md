# fetchJsonWithTimeout | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
fetchJsonWithTimeout(
    url: string,
    data?: Object,
    options?: { onTimeout?: Function; timeoutMs?: null | number },
): Promise<any>
```

A small wrapper that automatically asks for JSON with a Timeout

## Parameters

- **url**: *string*  
  The URL to make the Request to

- **data**: *Object* = {} *(Optional)*  
  The data of the Request

- **options**: { onTimeout?: *Function*; timeoutMs?: *null* | *number* } = {} *(Optional)*  
  Additional options

  - **onTimeout**?: *Function* *(Optional)*  
    A method to invoke if and when the timeout is reached

  - **timeoutMs**?: *null* | *number* *(Optional)*  
    How long to wait for a Response before cleanly aborting. If null, no timeout is applied. Default: 30000.

## Returns

*Promise<any>*

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)