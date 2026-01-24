# fromUuidSync

```typescript
fromUuidSync(
    uuid: string,
    options?: {
        invalid?: boolean;
        relative?: Document<object, DocumentConstructionContext>;
        strict?: boolean;
    },
): null | object | Document<object, DocumentConstructionContext>
```

Retrieve a Document by its Universally Unique Identifier (uuid) synchronously. If the uuid resolves to a compendium document, that document's index entry will be returned instead.

## Parameters

- **uuid**: *string*  
  The uuid of the Document to retrieve.

- **options** (optional):  
  ```typescript
  {
      invalid?: boolean;
      relative?: Document<object, DocumentConstructionContext>;
      strict?: boolean;
  } = {}
  ```
  Options to configure how a UUID is resolved.

  - **invalid**?: *boolean*  
    Allow retrieving an invalid Document.

  - **relative**?: *Document<object, DocumentConstructionContext>*  
    A Document to resolve relative UUIDs against.

  - **strict**?: *boolean*  
    Throw an error if the UUID cannot be resolved synchronously.

## Returns

*null* | *object* | [Document\<object, DocumentConstructionContext\>](https://foundryvtt.com/api/classes/foundry.abstract.Document.html)  
The Document or its index entry if it resides in a Compendium, otherwise null.

## Throws

An error if the uuid resolves to a Document that cannot be retrieved synchronously and the **strict** option is true.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)