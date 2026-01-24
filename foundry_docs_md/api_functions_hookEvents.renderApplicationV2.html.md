# renderApplicationV2 | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `renderApplicationV2`

```typescript
renderApplicationV2(
    application: ApplicationV2<
        ApplicationConfiguration,
        ApplicationRenderOptions
    >,
    element: HTMLElement,
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): void
```

A hook event that fires whenever an `ApplicationV2` is rendered. Substitute the `"ApplicationV2"` in the hook event to target a specific `ApplicationV2` type, for example `"renderMyApplication"`. Each `ApplicationV2` class in the inheritance chain will also fire this hook, i.e. `"renderApplicationV2"` will also fire. The hook provides the pending application HTML which will be added to the DOM. Hooked functions may modify that HTML or attach interactive listeners to it.

#### Parameters

- **application**: [`ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions>`](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)  
  The Application instance being rendered

- **element**: `HTMLElement`  
  The inner HTML of the document that will be displayed and may be modified

- **context**: [`ApplicationRenderContext`](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
  The application rendering context data

- **options**: [`ApplicationRenderOptions`](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  The application rendering options

#### Returns

- `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)