# ApplicationConfiguration | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ApplicationConfiguration {
    actions: Record<
        string,
        | ApplicationClickAction
        | { buttons: number[]; handler: ApplicationClickAction }
    >;
    classes: string[];
    form?: ApplicationFormConfiguration;
    id: string;
    position: Partial<ApplicationPosition>;
    tag: string;
    uniqueId: string;
    window: ApplicationWindowConfiguration;
}
```

## Properties

### **actions**

- Type: `Record<string, ApplicationClickAction | { buttons: number[]; handler: ApplicationClickAction }>`
- Description:  
  Click actions supported by the Application and their event handler functions. A handler function can be defined directly which only responds to left-click events. Otherwise, an object can be declared containing both a handler function and an array of buttons which are matched against the [PointerEvent#button](https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/button) property.

### **classes**

- Type: `string[]`
- Description:  
  An array of CSS classes to apply to the Application.

### **form** (optional)

- Type: [ApplicationFormConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationFormConfiguration.html)
- Description:  
  Configuration used if the application top-level element is a form or dialog.

### **id**

- Type: `string`
- Description:  
  An HTML element identifier used for this Application instance.

### **position**

- Type: `Partial<ApplicationPosition>`
- Description:  
  Default positioning data for the application. See [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html).

### **tag**

- Type: `string`
- Description:  
  The HTMLElement tag type used for the outer Application frame.

### **uniqueId**

- Type: `string`
- Description:  
  A string discriminator substituted for `{id}` in the default HTML element identifier for the class.

### **window**

- Type: [ApplicationWindowConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationWindowConfiguration.html)
- Description:  
  Configuration of the window behaviors for this Application.