# HTMLFilePickerElement | Foundry Virtual Tabletop - API Documentation - Version 13

A custom HTML element responsible for rendering a file input field and associated FilePicker button.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.elements.HTMLFilePickerElement), Expand

- *AbstractFormInputElement*
- **HTMLFilePickerElement**

---

## Properties

### button

**Type:** `HTMLButtonElement`  
A button to open the file picker interface.

### input

**Type:** `HTMLInputElement`  
The file path selected.

### picker

**Type:** [`FilePicker`](https://foundryvtt.com/api/classes/foundry.applications.apps.FilePicker.html)  
A reference to the FilePicker application instance originated by this element.

### _internals

**Type:** `ElementInternals`  
Attached ElementInternals which provides form handling functionality.  
*Inherited from [AbstractFormInputElement._internals](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_internals)*

### _primaryInput

**Type:** `HTMLElement`  
The primary input (if any). Used to determine what element should receive focus when an associated label is clicked on.  
*Inherited from [AbstractFormInputElement._primaryInput](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_primaryinput)*

### _value

**Type:** `string`  
The underlying value of the element.  
*Inherited from [AbstractFormInputElement._value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_value)*

### formAssociated

**Type:** `boolean` = `true`  
Declare that this custom element provides form element functionality.  
*Inherited from [AbstractFormInputElement.formAssociated](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#formassociated)*

### observedAttributes

**Type:** `string[]`  
Attributes requiring change notifications.  
*Inherited from [AbstractFormInputElement.observedAttributes](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#observedattributes)*

### tagName

**Type:** `string` = `"file-picker"`  
Overrides [AbstractFormInputElement.tagName](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#tagname)

---

## Accessors

### disabled

```typescript
get disabled(): boolean
```
Is this element disabled?  
*Inherited from AbstractFormInputElement.disabled*

### editable

```typescript
get editable(): boolean
```
Is this field editable? The field can be neither disabled nor readonly.  
*Inherited from AbstractFormInputElement.editable*

### form

```typescript
get form(): HTMLFormElement
```
The form this element belongs to.  
*Inherited from AbstractFormInputElement.form*

### name

```typescript
get name(): string
```
The input element name.  
*Inherited from AbstractFormInputElement.name*

### noupload

```typescript
get noupload(): boolean
```
Prevent uploading new files as part of this element's FilePicker dialog.

### type

```typescript
get type(): type
```
A type of file which can be selected in this field.  
See [foundry.applications.apps.FilePicker.FILE_TYPES](https://foundryvtt.com/api/classes/foundry.applications.apps.FilePicker.html#file_types)

### value

```typescript
get value(): FormInputValueType
```
The value of the input element.  
*Inherited from AbstractFormInputElement.value*

---

## Methods

### _activateListeners

```typescript
_activateListeners(): void
```
Overrides [AbstractFormInputElement._activateListeners](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_activatelisteners)

### _buildElements

```typescript
_buildElements(): (HTMLInputElement | HTMLButtonElement)[]
```
Overrides [AbstractFormInputElement._buildElements](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_buildelements)

### _refresh

```typescript
_refresh(): void
```
Overrides [AbstractFormInputElement._refresh](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_refresh)

### _toggleDisabled

```typescript
_toggleDisabled(disabled: any): void
```
**Parameters**

- **disabled**: `any`

Overrides [AbstractFormInputElement._toggleDisabled](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_toggledisabled)

### attributeChangedCallback

```typescript
attributeChangedCallback(
    attrName: string,
    oldValue: null | string,
    newValue: null | string,
): void
```
Fire a callback on change to an observed attribute.

**Parameters**

- **attrName**: `string`  
  The name of the attribute
- **oldValue**: `null | string`  
  The old value: null indicates the attribute was not present.
- **newValue**: `null | string`  
  The new value: null indicates the attribute is removed.

*Inherited from [AbstractFormInputElement.attributeChangedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#attributechangedcallback)*

### connectedCallback

```typescript
connectedCallback(): void
```
Initialize the custom element, constructing its HTML.  
*Inherited from [AbstractFormInputElement.connectedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#connectedcallback)*

### _getValue

```typescript
protected _getValue(): string
```
Return the value of the input element which should be submitted to the form.  
*Inherited from [AbstractFormInputElement._getValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_getvalue)*

### _onClick

```typescript
protected _onClick(event: PointerEvent): void
```
Special handling when the custom element is clicked. This should be implemented to transfer focus to an appropriate internal element.

**Parameters**

- **event**: `PointerEvent`

*Inherited from [AbstractFormInputElement._onClick](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_onclick)*

### _setValue

```typescript
protected _setValue(value: string): void
```
Translate user-provided input value into the format that should be stored.

**Parameters**

- **value**: `string`  
  A new value to assign to the element

**Throws**

- An error if the provided value is invalid

*Inherited from [AbstractFormInputElement._setValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_setvalue)*

### create

```typescript
static create(config: FormInputConfig<string> & FilePickerInputConfig): HTMLElement
```
Create a HTMLFilePickerElement using provided configuration data.

**Parameters**

- **config**: `FormInputConfig<string> & FilePickerInputConfig`

**Returns**  
`HTMLElement`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)