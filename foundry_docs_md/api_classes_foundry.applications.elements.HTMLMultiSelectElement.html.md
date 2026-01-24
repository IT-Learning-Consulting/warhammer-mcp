# HTMLMultiSelectElement | Foundry Virtual Tabletop - API Documentation - Version 13

Provide a multi-select workflow using a select element as the input mechanism.

**Example: Multi-Select HTML Markup**

```html
<multi-select name="select-many-things">
  <optgroup label="Basic Options">
     <option value="foo">Foo</option>
     <option value="bar">Bar</option>
     <option value="baz">Baz</option>
  </optgroup>
  <optgroup label="Advanced Options">
    <option value="fizz">Fizz</option>
    <option value="buzz">Buzz</option>
  </optgroup>
</multi-select>
```

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.elements.HTMLMultiSelectElement), Expand

- *AbstractMultiSelectElement*  
- **HTMLMultiSelectElement**

---

## Properties

### _value  
*Type:* `Set<any>`  
Inherited from [AbstractMultiSelectElement._value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_value)

---

### _choices  
*Type:* `Record<string, string>` = {}  
An object which maps option values to displayed labels.  
Inherited from [AbstractMultiSelectElement._choices](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_choices)

---

### _internals  
*Type:* `ElementInternals`  
Attached ElementInternals which provides form handling functionality.  
Inherited from [AbstractMultiSelectElement._internals](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_internals)

---

### _options  
*Type:* `(HTMLOptionElement | HTMLOptGroupElement)[]` = []  
Predefined and inherited options list.  
Inherited from [AbstractMultiSelectElement._options](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_options)

---

### _primaryInput  
*Type:* `HTMLElement`  
The primary input (if any). Used to determine what element should receive focus when an associated label is clicked on.  
Inherited from [AbstractMultiSelectElement._primaryInput](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_primaryInput)

---

### formAssociated  
*Type:* `boolean` = true  
Declare that this custom element provides form element functionality.  
Inherited from [AbstractMultiSelectElement.formAssociated](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#formassociated)

---

### observedAttributes  
*Type:* `string[]`  
Attributes requiring change notifications.  
Inherited from [AbstractMultiSelectElement.observedAttributes](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#observedAttributes)

---

### tagName  
*Type:* `string` = "multi-select"  
Overrides [AbstractMultiSelectElement.tagName](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#tagName)

---

## Accessors

### disabled  
```typescript
get disabled(): boolean
```
Is this element disabled?  
**Returns:** `boolean`  
Inherited from AbstractMultiSelectElement.disabled

---

### editable  
```typescript
get editable(): boolean
```
Is this field editable? The field can be neither disabled nor readonly.  
**Returns:** `boolean`  
Inherited from AbstractMultiSelectElement.editable

---

### form  
```typescript
get form(): HTMLFormElement
```
The form this element belongs to.  
**Returns:** `HTMLFormElement`  
Inherited from AbstractMultiSelectElement.form

---

### name  
```typescript
get name(): string
```
The input element name.  
**Returns:** `string`  
Inherited from AbstractMultiSelectElement.name

---

### value  
```typescript
get value(): FormInputValueType
```
The value of the input element.  
**Returns:** `FormInputValueType`  
Inherited from AbstractMultiSelectElement.value

---

## Methods

### _activateListeners  
```typescript
_activateListeners(): void
```
Overrides [AbstractMultiSelectElement._activateListeners](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_activateListeners)  
**Returns:** `void`

---

### _buildElements  
```typescript
_buildElements(): (HTMLDivElement | HTMLSelectElement)[]
```
Overrides [AbstractMultiSelectElement._buildElements](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_buildElements)  
**Returns:** `(HTMLDivElement | HTMLSelectElement)[]`

---

### _getValue  
```typescript
_getValue(): any[]
```
Inherited from [AbstractMultiSelectElement._getValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_getValue)  
**Returns:** `any[]`

---

### _refresh  
```typescript
_refresh(): void
```
Overrides [AbstractMultiSelectElement._refresh](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_refresh)  
**Returns:** `void`

---

### _setValue  
```typescript
_setValue(value: any): void
```
**Parameters:**  
- **value**: `any`  
Inherited from [AbstractMultiSelectElement._setValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_setValue)  
**Returns:** `void`

---

### _toggleDisabled  
```typescript
_toggleDisabled(disabled: any): void
```
Overrides [AbstractMultiSelectElement._toggleDisabled](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_toggleDisabled)  
**Parameters:**  
- **disabled**: `any`  
**Returns:** `void`

---

### attributeChangedCallback  
```typescript
attributeChangedCallback(
  attrName: string, 
  oldValue: null | string, 
  newValue: null | string
): void
```
Fire a callback on change to an observed attribute.  
**Parameters:**  
- **attrName**: `string` — The name of the attribute  
- **oldValue**: `null | string` — The old value: null indicates the attribute was not present.  
- **newValue**: `null | string` — The new value: null indicates the attribute is removed.  
Inherited from [AbstractMultiSelectElement.attributeChangedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#attributeChangedCallback)  
**Returns:** `void`

---

### connectedCallback  
```typescript
connectedCallback(): void
```
Initialize the custom element, constructing its HTML.  
Inherited from [AbstractMultiSelectElement.connectedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#connectedCallback)  
**Returns:** `void`

---

### select  
```typescript
select(value: string): void
```
Mark a choice as selected.  
**Parameters:**  
- **value**: `string` — The value to add to the chosen set  
Inherited from [AbstractMultiSelectElement.select](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#select)  
**Returns:** `void`

---

### unselect  
```typescript
unselect(value: string): void
```
Mark a choice as un-selected.  
**Parameters:**  
- **value**: `string` — The value to delete from the chosen set  
Inherited from [AbstractMultiSelectElement.unselect](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#unselect)  
**Returns:** `void`

---

### _initialize  
```typescript
_initialize(): void
```
Protected  
Preserve existing state.  
Inherited from [AbstractMultiSelectElement._initialize](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_initialize)  
**Returns:** `void`

---

### _onClick  
```typescript
_onClick(event: PointerEvent): void
```
Protected  
Special handling when the custom element is clicked. This should be implemented to transfer focus to an appropriate internal element.  
**Parameters:**  
- **event**: `PointerEvent`  
Inherited from [AbstractMultiSelectElement._onClick](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html#_onClick)  
**Returns:** `void`

---

### create  
```typescript
static create(
  config: FormInputConfig<string[]> & Omit<SelectInputConfig, "blank">
): HTMLMultiSelectElement
```
Create a HTMLMultiSelectElement using provided configuration data.  
**Parameters:**  
- **config**: `FormInputConfig<string[]> & Omit<SelectInputConfig, "blank">`  
**Returns:** `HTMLMultiSelectElement`

---

For more details, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).