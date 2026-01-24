# closeApplicationV1 | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `closeApplicationV1`

```typescript
closeApplicationV1(application: Application, html: JQuery): void
```

A hook event that fires whenever this `ApplicationV1` is closed. Substitute the `"ApplicationV1"` in the hook event to target a specific `ApplicationV1` type, for example `"closeMyApplication"`. Each `ApplicationV1` class in the inheritance chain will also fire this hook, i.e. `"closeApplication"` will also fire.

#### Parameters

- **application**: [Application](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html)  
  The `ApplicationV1` instance being closed
- **html**: `JQuery`  
  The application jQuery when it is closed

#### Returns

`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)