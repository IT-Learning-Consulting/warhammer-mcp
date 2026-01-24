# FormGroupConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface FormGroupConfig {
    classes?: string[];
    hidden?: boolean | "until-found";
    hint?: string;
    input: HTMLElement | HTMLCollection;
    label: string;
    localize?: boolean;
    rootId?: string;
    stacked?: boolean;
    units?: string;
    widget?: any;
}
```

## Properties

### Optional

#### **classes**
- Type: `string[]`  
An array of CSS classes applied to the form group element

#### **hidden**
- Type: `boolean` | `"until-found"`  
The value of the form group's hidden attribute

#### **hint**
- Type: `string`  
Hint text displayed as part of the form group

#### **localize**
- Type: `boolean`  
Should labels or other elements within this form group be automatically localized?

#### **rootId**
- Type: `string`  
Some parent CSS id within which field names are unique. If provided, this root ID is used to automatically assign `"id"` attributes to input elements and `"for"` attributes to corresponding labels.

#### **stacked**
- Type: `boolean`  
Is the `"stacked"` class applied to the form group

#### **units**
- Type: `string`  
An optional units string which is appended to the label

#### **widget**
- Type: `any`  
A custom form group widget function which replaces the default group HTML generation

### Required

#### **input**
- Type: `HTMLElement` | `HTMLCollection`  
An HTML element or collection of elements which provide the inputs for the group

#### **label**
- Type: `string`  
A text label to apply to the form group

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)