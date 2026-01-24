# DocumentTagsInputConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DocumentTagsInputConfig {
    max?: number;
    single?: boolean;
    type?: string;
}
```

## Properties

- **max?**: *number*  
  Only allow attaching a maximum number of documents.

- **single?**: *boolean*  
  Only allow referencing a single document. In this case the submitted form value will be a single UUID string rather than an array.

- **type?**: *string*  
  A specific document type in [CONST.ALL_DOCUMENT_TYPES](https://foundryvtt.com/api/index.html).

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)