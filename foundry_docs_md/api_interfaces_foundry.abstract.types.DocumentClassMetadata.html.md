# DocumentClassMetadata | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface DocumentClassMetadata {
    collection: string;
    compendiumIndexFields: string[];
    coreTypes: string[];
    embedded: Record<string, string>;
    hasTypeData: boolean;
    indexed: boolean;
    label: string;
    name: string;
    permissions: Record<
        | "update"
        | "delete"
        | "create"
        | "view"
        | "INHERIT"
        | "NONE"
        | "LIMITED"
        | "OBSERVER"
        | "OWNER"
        | "PLAYER"
        | "TRUSTED"
        | "ASSISTANT"
        | "GAMEMASTER",
        DocumentPermissionTest
    >;
    preserveOnImport: string[];
    schemaVersion?: string;
}
```

## Properties

- **collection**: `string`

- **compendiumIndexFields**: `string[]`

- **coreTypes**: `string[]`

- **embedded**: `Record<string, string>`

- **hasTypeData**: `boolean`

- **indexed**: `boolean`

- **label**: `string`

- **name**: `string`

- **permissions**: `Record< "update" | "delete" | "create" | "view" | "INHERIT" | "NONE" | "LIMITED" | "OBSERVER" | "OWNER" | "PLAYER" | "TRUSTED" | "ASSISTANT" | "GAMEMASTER", [DocumentPermissionTest](https://foundryvtt.com/api/types/foundry.abstract.types.DocumentPermissionTest.html) >`

- **preserveOnImport**: `string[]`

- **schemaVersion?**: `string` (optional)