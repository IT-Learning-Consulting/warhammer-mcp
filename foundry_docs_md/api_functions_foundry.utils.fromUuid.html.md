# fromUuid

```typescript
fromUuid(
    uuid: string,
    options?: {
        invalid?: boolean;
        relative?: Document<object, DocumentConstructionContext>;
    },
): Promise<null | Document<object, DocumentConstructionContext>>
```

Retrieve a Document by its Universally Unique Identifier (uuid).

## Parameters

- **uuid**: _string_  
  The uuid of the Document to retrieve.

- **options?**:  
  Options to configure how a UUID is resolved. Default: `{}`

  - **invalid?**: _boolean_  
    Allow retrieving an invalid Document.

  - **relative?**: _Document<object, DocumentConstructionContext>_  
    A Document to resolve relative UUIDs against.

## Returns

_Promise<null | Document<object, DocumentConstructionContext>>_  
Returns the Document if it could be found, otherwise `null`.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)