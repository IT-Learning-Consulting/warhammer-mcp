# HTMLMultiCheckboxElement | Foundry Virtual Tabletop - API Documentation - Version 13

Provide a multi-select workflow as a grid of input checkbox elements.

Example: Multi-Checkbox HTML Markup

```html
<multi-checkbox name="check-many-boxes">
  <optgroup label="Basic Options">
    <option value="foo">Foo</option>
    <option value="bar">Bar</option>
    <option value="baz">Baz</option>
  </optgroup>
  <optgroup label="Advanced Options">
    <option value="fizz">Fizz</option>
    <option value="buzz">Buzz</option>
  </optgroup>
</multi-checkbox>
```

Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.elements.HTMLMultiCheckboxElement), Expand)  
- *AbstractMultiSelectElement*  
- **HTMLMultiCheckboxElement**

---

## Properties

### _value
- Type: `Set<any>`
- Description: Inherited from [AbstractMultiSelectElement._value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_value)

---

### _choices
- Type: `Record<string, string> = {}`
- Description: An object which maps option values to displayed labels.  
Inherited from [AbstractMultiSelectElement._choices](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_choices)

---

### _internals
- Type: `ElementInternals`
- Description: Attached ElementInternals which provides form handling functionality.  
Inherited from [AbstractMultiSelectElement._internals](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_internals)

---

### _options
- Type: `(HTMLOptionElement | HTMLOptGroupElement)[] = []`
- Description: Predefined and  
Inherited from [AbstractMultiSelectElement._options](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_options)

---

### _primaryInput
- Type: `HTMLElement`
- Description: The primary input (if any). Used to determine what element should receive focus when an associated label is clicked on.  
Inherited from [AbstractMultiSelectElement._primaryInput](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_primaryinput)

---

### Static Properties

#### formAssociated
- Type: `boolean = true`
- Description: Declare that this custom element provides form element functionality.  
Inherited from [AbstractMultiSelectElement.formAssociated](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#formassociated)

---

#### observedAttributes
- Type: `string[] = ...`  
Inherited from [AbstractMultiSelectElement.observedAttributes](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#observedattributes)

---

#### tagName
- Type: `string = "multi-checkbox"`
- Description: Overrides [AbstractMultiSelectElement.tagName](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#tagname)

---

## Accessors

### disabled
```typescript
get disabled(): boolean
```
Is this element disabled?  
Returns: `boolean`  
Inherited from AbstractMultiSelectElement.disabled

---

### editable
```typescript
get editable(): boolean
```
Is this field editable? The field can be neither disabled nor readonly.  
Returns: `boolean`  
Inherited from AbstractMultiSelectElement.editable

---

### form
```typescript
get form(): HTMLFormElement
```
The form this element belongs to.  
Returns: `HTMLFormElement`  
Inherited from AbstractMultiSelectElement.form

---

### name
```typescript
get name(): string
```
The input element name.  
Returns: `string`  
Inherited from AbstractMultiSelectElement.name

---

### value
```typescript
get value(): FormInputValueType
```
The value of the input element.  
Returns: `FormInputValueType`  
Inherited from AbstractMultiSelectElement.value  
> See also: [FormInputValueType](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#forminputvaluetype)

---

## Methods

### _activateListeners
```typescript
_activateListeners(): void
```
Overrides [AbstractMultiSelectElement._activateListeners](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_activatelisteners)  
Returns: `void`

---

### _buildElements
```typescript
_buildElements(): (HTMLLabelElement | HTMLFieldSetElement)[]
```
Overrides [AbstractMultiSelectElement._buildElements](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_buildelements)  
Returns: `(HTMLLabelElement | HTMLFieldSetElement)[]`

---

### _getValue
```typescript
_getValue(): any[]
```
Inherited from [AbstractMultiSelectElement._getValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_getvalue)  
Returns: `any[]`

---

### _refresh
```typescript
_refresh(): void
```
Overrides [AbstractMultiSelectElement._refresh](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_refresh)  
Returns: `void`

---

### _setValue
```typescript
_setValue(value: any): void
```
- **value**: `any`  
Inherited from [AbstractMultiSelectElement._setValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_setvalue)  
Returns: `void`

---

### _toggleDisabled
```typescript
_toggleDisabled(disabled: any): void
```
- **disabled**: `any`  
Overrides [AbstractMultiSelectElement._toggleDisabled](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_toggledisabled)  
Returns: `void`

---

### attributeChangedCallback
```typescript
attributeChangedCallback(
  attrName: string,
  oldValue: null | string,
  newValue: null | string,
): void
```
Fire a callback on change to an observed attribute.  
- **attrName**: `string` - The name of the attribute  
- **oldValue**: `null | string` - The old value: null indicates the attribute was not present.  
- **newValue**: `null | string` - The new value: null indicates the attribute is removed.  
Returns: `void`  
Inherited from [AbstractMultiSelectElement.attributeChangedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#attributechangedcallback)

---

### connectedCallback
```typescript
connectedCallback(): void
```
Initialize the custom element, constructing its HTML.  
Returns: `void`  
Inherited from [AbstractMultiSelectElement.connectedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#connectedcallback)

---

### select
```typescript
select(value: string): void
```
Mark a choice as selected.  
- **value**: `string` - The value to add to the chosen set  
Returns: `void`  
Inherited from [AbstractMultiSelectElement.select](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#select)

---

### unselect
```typescript
unselect(value: string): void
```
Mark a choice as un-selected.  
- **value**: `string` - The value to delete from the chosen set  
Returns: `void`  
Inherited from [AbstractMultiSelectElement.unselect](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#unselect)

---

### _initialize
```typescript
_initialize(): void
```
Protected  
Preserve existing  
Returns: `void`  
Inherited from [AbstractMultiSelectElement._initialize](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_initialize)

---

### _onClick
```typescript
_onClick(event: PointerEvent): void
```
Protected  
Special handling when the custom element is clicked. This should be implemented to transfer focus to an appropriate internal element.  
- **event**: `PointerEvent`  
Returns: `void`  
Inherited from [AbstractMultiSelectElement._onClick](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_onclick)

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)