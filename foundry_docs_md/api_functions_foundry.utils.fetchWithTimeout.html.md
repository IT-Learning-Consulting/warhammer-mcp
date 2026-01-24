# fetchWithTimeout | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
fetchWithTimeout(
    url: string,
    data?: RequestInit,
    options?: { onTimeout?: Function; timeoutMs?: null | number },
): Promise<Response>
```

A wrapper method around `fetch` that attaches an AbortController signal to the `fetch` call for clean timeouts.

## Parameters

- **url**: `string`  
  The URL to make the Request to

- **data**: `RequestInit` = `{}` (Optional)  
  The data of the Request

- **options**: `{ onTimeout?: Function; timeoutMs?: null | number }` = `{}` (Optional)  
  Additional options
  - **onTimeout**?: `Function` (Optional)  
    A method to invoke if and when the timeout is reached
  - **timeoutMs**?: `null | number` (Optional)  
    How long to wait for a Response before cleanly aborting. If `null`, no timeout is applied. Default: `30000`.

## Returns

`Promise<Response>`

## See

[Aborting a fetch with timeout or explicit abort - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal#aborting_a_fetch_with_timeout_or_explicit_abort)

## Throws

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)