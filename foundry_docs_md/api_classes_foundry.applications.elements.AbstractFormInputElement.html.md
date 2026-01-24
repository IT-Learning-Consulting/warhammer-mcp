# AbstractFormInputElement | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract custom HTMLElement designed for use with form inputs.

---

## Type Parameters

- **FormInputValueType**

---

## Fires

- **input**  
  An "input" event when the value of the input changes
- **change**  
  A "change" event when the value of the element changes

---

## Hierarchy

- _HTMLElement_
- **AbstractFormInputElement**
- [AbstractMultiSelectElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractMultiSelectElement.html)
- [HTMLCodeMirrorElement](https://foundryvtt.com/api/classes/foundry.applications.elements.HTMLCodeMirrorElement.html)
- [HTMLColorPickerElement](https://foundryvtt.com/api/classes/foundry.applications.elements.HTMLColorPickerElement.html)
- [HTMLDocumentTagsElement](https://foundryvtt.com/api/classes/foundry.applications.elements.HTMLDocumentTagsElement.html)
- [HTMLFilePickerElement](https://foundryvtt.com/api/classes/foundry.applications.elements.HTMLFilePickerElement.html)
- [HTMLHueSelectorSlider](https://foundryvtt.com/api/classes/foundry.applications.elements.HTMLHueSelectorSlider.html)
- [HTMLRangePickerElement](https://foundryvtt.com/api/classes/foundry.applications.elements.HTMLRangePickerElement.html)
- [HTMLStringTagsElement](https://foundryvtt.com/api/classes/foundry.applications.elements.HTMLStringTagsElement.html)
- [HTMLProseMirrorElement](https://foundryvtt.com/api/classes/foundry.applications.elements.HTMLProseMirrorElement.html)

---

## Properties

### Protected

- **_internals**: `ElementInternals`  
  Attached ElementInternals which provides form handling functionality.

- **_primaryInput**: `HTMLElement`  
  The primary input (if any). Used to determine what element should receive focus when an associated label is clicked on.

- **_value**: `FormInputValueType`  
  The underlying value of the element.

### Static

- **formAssociated**: `boolean` = `true`  
  Declare that this custom element provides form element functionality.

- **observedAttributes**: `string[]`  
  Attributes requiring change notifications.

---

## Accessors

- **static tagName**: `string`  
  The HTML tag name used by this element.

- **disabled**: `boolean`  
  Is this element disabled?  
  **Returns:** `boolean`

- **editable**: `boolean`  
  Is this field editable? The field can be neither disabled nor readonly.  
  **Returns:** `boolean`

- **form**: `HTMLFormElement`  
  The form this element belongs to.  
  **Returns:** `HTMLFormElement`

- **name**: `string`  
  The input element name.  
  **Returns:** `string`

- **value**: `FormInputValueType`  
  The value of the input element.  
  **Returns:** `FormInputValueType`

---

## Methods

```typescript
attributeChangedCallback(
  attrName: string,
  oldValue: null | string,
  newValue: null | string,
): void
```
Fire a callback on change to an observed attribute.

- **Parameters:**
  - **attrName**: `string`  
    The name of the attribute
  - **oldValue**: `null | string`  
    The old value: `null` indicates the attribute was not present.
  - **newValue**: `null | string`  
    The new value: `null` indicates the attribute is removed.
- **Returns:** `void`

```typescript
connectedCallback(): void
```
Initialize the custom element, constructing its HTML.

- **Returns:** `void`

### Protected Methods

```typescript
_activateListeners(): void
```
Activate event listeners which add dynamic behavior to the custom element.

- **Returns:** `void`

```typescript
_buildElements(): HTMLElement[]
```
Create the HTML elements that should be included in this custom element.  
Elements are returned as an array of ordered children.

- **Returns:** `HTMLElement[]`

```typescript
_getValue(): FormInputValueType
```
Return the value of the input element which should be submitted to the form.

- **Returns:** `FormInputValueType`

```typescript
_onClick(event: PointerEvent): void
```
Special handling when the custom element is clicked. This should be implemented to transfer focus to an appropriate internal element.

- **Parameters:**
  - **event**: `PointerEvent`
- **Returns:** `void`

```typescript
_refresh(): void
```
Refresh the active state of the custom element.

- **Returns:** `void`

```typescript
_setValue(value: FormInputValueType): void
```
Translate user-provided input value into the format that should be stored.

- **Parameters:**
  - **value**: `FormInputValueType`  
    A new value to assign to the element
- **Returns:** `void`
- **Throws:** An error if the provided value is invalid

```typescript
_toggleDisabled(disabled: boolean): void
```
Special behaviors that the subclass should implement when toggling the disabled state of the input.

- **Parameters:**
  - **disabled**: `boolean`  
    The new disabled state
- **Returns:** `void`

---

For the full API, visit [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html).