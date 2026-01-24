# logCompatibilityWarning

```typescript
logCompatibilityWarning(
    message: string,
    options?: {
        details?: string;
        mode?: number;
        once?: boolean;
        since?: string | number;
        stack?: boolean;
        until?: string | number;
    },
): void
```

Log a compatibility warning which is filtered based on the client's defined compatibility settings.

## Parameters

- **message**: `string`  
  The original warning or error message

- **options** (optional):  
  Additional options which customize logging. Defaults to `{}`.

  - **details**? `string`  
    Additional details to append to the logged message

  - **mode**? `number`  
    A logging level in `COMPATIBILITY_MODES` which overrides the configured default

  - **once**? `boolean`  
    Log this message only once?

  - **since**? `string | number`  
    A version identifier since which a change was made

  - **stack**? `boolean`  
    Include the message stack trace

  - **until**? `string | number`  
    A version identifier until which a change remains supported

## Returns

- `void`

## Throws

- An `Error` if the mode is `ERROR`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)