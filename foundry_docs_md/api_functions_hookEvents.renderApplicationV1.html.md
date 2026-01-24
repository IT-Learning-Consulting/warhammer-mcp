# renderApplicationV1 | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
renderApplicationV1(application: Application, html: JQuery, data: object): void
```

A hook event that fires whenever an ApplicationV1 is rendered. Substitute the "ApplicationV1" in the hook event to target a specific ApplicationV1 type, for example "renderMyApplication". Each ApplicationV1 class in the inheritance chain will also fire this hook, i.e. "renderApplication" will also fire. The hook provides the pending application HTML which will be added to the DOM. Hooked functions may modify that HTML or attach interactive listeners to it.

### Parameters

- **application**: [Application](https://foundryvtt.com/api/classes/foundry.appv1.api.Application.html)  
  The ApplicationV1 instance being rendered

- **html**: `JQuery`  
  The inner jQuery of the document that will be displayed and may be modified

- **data**: `object`  
  The object of data used when rendering the application

### Returns

`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)