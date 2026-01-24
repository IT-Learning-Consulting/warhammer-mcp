# slugify

```typescript
slugify(
    options?: {
        lowercase?: boolean;
        replacement?: string;
        strict?: boolean;
    },
): string
```

Transform any string into an url-viable slug string

## Parameters

- **options** (optional):  
  An object to customize how the slugify operation is performed. Default is `{}`.

  - **lowercase** (optional, boolean):  
    Lowercase the string.

  - **replacement** (optional, string):  
    The replacement character to separate terms, default is `'-'`.

  - **strict** (optional, boolean):  
    Replace all non-alphanumeric characters, or allow them? Default is `false`.

## Returns

- `string`  
  The slugified input string

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)