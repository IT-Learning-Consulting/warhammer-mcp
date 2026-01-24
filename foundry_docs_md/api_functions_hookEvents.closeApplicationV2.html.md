# closeApplicationV2 | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
closeApplicationV2(
    application: ApplicationV2<
        ApplicationConfiguration,
        ApplicationRenderOptions,
    >,
): void
```

A hook event that fires whenever this `ApplicationV2` is closed. Substitute the `"ApplicationV2"` in the hook event to target a specific `ApplicationV2` type, for example `"closeMyApplication"`. Each `ApplicationV2` class in the inheritance chain will also fire this hook, i.e. `"closeApplicationV2"` will also fire.

### Parameters

- **application**: [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)\
  The Application instance being closed. It is a generic with:
  - [ApplicationConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationConfiguration.html)
  - [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)

### Returns

- `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)