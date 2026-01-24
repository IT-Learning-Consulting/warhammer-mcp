# ApplicationFormSubmission | Foundry Virtual Tabletop - API Documentation - Version 13

### Type Alias

```typescript
ApplicationFormSubmission: (
  event: SubmitEvent | Event,
  form: HTMLFormElement,
  formData: FormDataExtended,
) => Promise<any>
```

A form submission handler method. Run in the context of a  
[foundry.applications.api.HandlebarsApplicationMixin](https://foundryvtt.com/api/functions/foundry.applications.api.HandlebarsApplicationMixin.html).

---

### Parameters

- **event**: `SubmitEvent | Event`  
  The originating form submission or input change event

- **form**: `HTMLFormElement`  
  The form element that was submitted

- **formData**: [`FormDataExtended`](https://foundryvtt.com/api/classes/foundry.applications.ux.FormDataExtended.html)  
  Processed data for the submitted form

---

### Returns

`Promise<any>`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)