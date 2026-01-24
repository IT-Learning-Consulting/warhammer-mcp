# radioBoxes | Foundry Virtual Tabletop - API Documentation - Version 13

### Function `radioBoxes`

```typescript
radioBoxes(
    name: string,
    choices: object,
    options: { checked: string; localize: boolean },
): SafeString
```

A helper to create a set of radio checkbox input elements in a named set. The provided keys are the possible radio values while the provided values are human-readable labels.

**Parameters**

- **name**: `string`  
  The radio checkbox field name

- **choices**: `object`  
  A mapping of radio checkbox values to human-readable labels

- **options**: `{ checked: string; localize: boolean }`  
  Options which customize the radio boxes creation
  - **checked**: `string`  
    Which key is currently checked?
  - **localize**: `boolean`  
    Pass each label through string localization?

**Returns**  
`SafeString`

---

**Example: The provided input data**

```typescript
let groupName = "importantChoice";
let choices = { a: "Choice A", b: "Choice B" };
let chosen = "a";
```

**Example: The template HTML structure**

```handlebars
<div class="form-group">
  <label>Radio Group Label</label>
  <div class="form-fields">
    {{radioBoxes groupName choices checked=chosen localize=true}}
  </div>
</div>
```

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[Foundry Virtual Tabletop - API Documentation - Version 13 / foundry](https://foundryvtt.com/api/modules/foundry.html)  
[foundry.applications](https://foundryvtt.com/api/modules/foundry.applications.html)  
[foundry.applications.handlebars](https://foundryvtt.com/api/modules/foundry.applications.handlebars.html)  
[Function radioBoxes](https://foundryvtt.com/api/functions/foundry.applications.handlebars.radioBoxes.html)