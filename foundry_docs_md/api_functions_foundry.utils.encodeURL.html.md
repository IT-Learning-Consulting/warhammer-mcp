# encodeURL | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `encodeURL`

```typescript
encodeURL(path: string): string
```

Encode a URL-like string by replacing any characters which need encoding. To reverse this encoding, the native `decodeURIComponent` can be used on the whole encoded string, without adjustment.

**Parameters**

- **path**: `string`  
  A fully-qualified URL or URL component (like a relative path)

**Returns**  
`string`  
An encoded URL string

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)