# getHeaderControlsApplicationV2 | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `getHeaderControlsApplicationV2`

```typescript
getHeaderControlsApplicationV2(
    application: ApplicationV2<
        ApplicationConfiguration,
        ApplicationRenderOptions,
    >,
    controls: ApplicationHeaderControlsEntry[],
): void
```

A hook event that fires whenever this `ApplicationV2` is rendered to add controls to its header.  
Substitute the `"ApplicationV2"` in the hook event to target a specific `ApplicationV2` type, for example `"renderMyApplication"`. Each Application class in the inheritance chain will also fire this hook, i.e. `"getHeaderControlsApplicationV2"` will also fire.

#### Parameters

- **application**: [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)<[ApplicationConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationConfiguration.html), [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)>  
  The Application instance being rendered
- **controls**: [ApplicationHeaderControlsEntry](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html)[]  
  The array of header control menu options

#### Returns

`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)