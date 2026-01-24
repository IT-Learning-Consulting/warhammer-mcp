# getDocumentContextOptions | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `getDocumentContextOptions`

```typescript
getDocumentContextOptions(
    application: ApplicationV2<
        ApplicationConfiguration,
        ApplicationRenderOptions,
    >,
    menuItems: ContextMenuEntry[],
): void
```

A hook event that fires when a context menu related to a certain Document type is being prepared. Substitute "Document" in the hook name to target a specific document class, for example `getActorContextOptions`.

#### Parameters

- **application**: [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)<[ApplicationConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationConfiguration.html), [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)>  
  The Application instance that the context menu is constructed within

- **menuItems**: [ContextMenuEntry](https://foundryvtt.com/api/interfaces/foundry.ContextMenuEntry.html)[]  
  An array of prepared menu items which should be mutated by the hook

#### Returns

`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)