# getApplicationV1HeaderButtons | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
getApplicationV1HeaderButtons(
    application: Application,
    buttons: ApplicationV1HeaderButton[],
): void
```

A hook event that fires whenever this ApplicationV1 is first rendered to add buttons to its header. Substitute the "ApplicationV1" in the hook event to target a specific ApplicationV1 type, for example `"getMyApplicationHeaderButtons"`. Each Application class in the inheritance chain will also fire this hook, i.e. `"getApplicationHeaderButtons"` will also fire.

### Parameters

- **application**: [Application](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html)  
  The ApplicationV1 instance being rendered

- **buttons**: [ApplicationV1HeaderButton](https://foundryvtt.com/api/types/foundry.ApplicationV1HeaderButton.html)[]  
  The array of header buttons which will be displayed

### Returns

- `void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)