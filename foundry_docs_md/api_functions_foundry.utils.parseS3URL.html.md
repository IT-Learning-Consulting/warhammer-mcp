# parseS3URL | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `parseS3URL`

```typescript
parseS3URL(key: string): { bucket: null | string; keyPrefix: string }
```

Parse an S3 key to learn the bucket and the key prefix used for the request.

**Parameters**

- **key**: `string`  
  A fully qualified key name or prefix path.

**Returns**

An object containing:  
- **bucket**: `null | string`  
- **keyPrefix**: `string`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)