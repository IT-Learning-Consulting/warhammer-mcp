# HandlebarsTemplatePart | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface HandlebarsTemplatePart {
    classes?: string[];
    forms?: Record<string, ApplicationFormConfiguration>;
    id?: string;
    root?: boolean;
    scrollable?: string[];
    template: string;
    templates?: string[];
}
```

## Properties

### Optional

- **classes**?: `string[]`  
  An array of CSS classes to apply to the top-level element of the rendered part.

- **forms**?: `Record<string, ApplicationFormConfiguration>`  
  A registry of forms selectors and submission handlers.  
  See [ApplicationFormConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationFormConfiguration.html).

- **id**?: `string`  
  A CSS id to assign to the top-level element of the rendered part. This id string is automatically prefixed by the application id.

- **root**?: `boolean`  
  Does this rendered contents of this template part replace the children of the root element?

- **scrollable**?: `string[]`  
  An array of selectors within this part whose scroll positions should be persisted during a re-render operation. A blank string is used to denote that the root level of the part is scrollable.

- **templates**?: `string[]`  
  An array of additional templates that are required to render the part. If omitted, only the entry-point is inferred as required.

### Required

- **template**: `string`  
  The template entry-point for the part.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)