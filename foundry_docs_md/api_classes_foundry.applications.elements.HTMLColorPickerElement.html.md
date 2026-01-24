# HTMLColorPickerElement

A custom `HTMLElement` used to select a color using a linked pair of input fields.

## Hierarchy  
* [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html)  
* **HTMLColorPickerElement**

---

## Constructors

```typescript
new HTMLColorPickerElement(
    options?: HTMLColorPickerOptions,
): HTMLColorPickerElement
```

**Parameters**

- **options**: `HTMLColorPickerOptions = {}` (Optional)

**Returns**

- `HTMLColorPickerElement`

Overrides `AbstractFormInputElement.constructor`

---

## Properties

### Protected

- **_internals**: `ElementInternals`  
  Attached ElementInternals which provides form handling functionality.  
  Inherited from [AbstractFormInputElement._internals](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_internals)

- **_primaryInput**: `HTMLElement`  
  The primary input (if any). Used to determine what element should receive focus when an associated label is clicked on.  
  Inherited from [AbstractFormInputElement._primaryInput](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_primaryinput)

- **_value**: `string`  
  The underlying value of the element.  
  Inherited from [AbstractFormInputElement._value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_value)  

---

## Static Properties

- **formAssociated**: `boolean = true`  
  Declare that this custom element provides form element functionality.  
  Inherited from [AbstractFormInputElement.formAssociated](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#formassociated)

- **observedAttributes**: `string[]`  
  Attributes requiring change notifications  
  Inherited from [AbstractFormInputElement.observedAttributes](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#observedattributes)

- **tagName**: `string = "color-picker"`  
  Overrides [AbstractFormInputElement.tagName](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#tagname)

---

## Accessors

- **disabled**: `boolean`  
  Is this element disabled?  
  Returns: `boolean`  
  Inherited from `AbstractFormInputElement.disabled`

- **editable**: `boolean`  
  Is this field editable? The field can be neither disabled nor readonly.  
  Returns: `boolean`  
  Inherited from `AbstractFormInputElement.editable`

- **form**: `HTMLFormElement`  
  The form this element belongs to.  
  Returns: `HTMLFormElement`  
  Inherited from `AbstractFormInputElement.form`

- **name**: `string`  
  The input element name.  
  Returns: `string`  
  Inherited from `AbstractFormInputElement.name`

- **value**: `FormInputValueType`  
  The value of the input element.  
  Returns: `FormInputValueType`  
  Inherited from `AbstractFormInputElement.value`

---

## Methods

### _activateListeners

```typescript
_activateListeners(): void
```

Overrides [AbstractFormInputElement._activateListeners](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_activatelisteners)  
Returns: `void`

---

### _buildElements

```typescript
_buildElements(): HTMLInputElement[]
```

Overrides [AbstractFormInputElement._buildElements](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_buildelements)  
Returns: `HTMLInputElement[]`

---

### _refresh

```typescript
_refresh(): void
```

Overrides [AbstractFormInputElement._refresh](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_refresh)  
Returns: `void`

---

### _toggleDisabled

```typescript
_toggleDisabled(disabled: any): void
```

**Parameters**

- **disabled**: `any`

Overrides [AbstractFormInputElement._toggleDisabled](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_toggledisabled)  
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

**Parameters**

- **attrName**: `string`  
  The name of the attribute

- **oldValue**: `null | string`  
  The old value: `null` indicates the attribute was not present.

- **newValue**: `null | string`  
  The new value: `null` indicates the attribute is removed.

Returns: `void`  
Inherited from [AbstractFormInputElement.attributeChangedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#attributechangedcallback)

---

### connectedCallback

```typescript
connectedCallback(): void
```

Initialize the custom element, constructing its HTML.  
Returns: `void`  
Inherited from [AbstractFormInputElement.connectedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#connectedcallback)

---

### _getValue

```typescript
_getValue(): string
```

Protected  
Return the value of the input element which should be submitted to the form.

Returns: `string`  
Inherited from [AbstractFormInputElement._getValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_getvalue)

---

### _onClick

```typescript
_onClick(event: PointerEvent): void
```

Protected  
Special handling when the custom element is clicked. This should be implemented to transfer focus to an appropriate internal element.

**Parameters**

- **event**: `PointerEvent`

Returns: `void`  
Inherited from [AbstractFormInputElement._onClick](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_onclick)

---

### _setValue

```typescript
_setValue(value: string): void
```

Protected  
Translate user-provided input value into the format that should be stored.

**Parameters**

- **value**: `string`  
  A new value to assign to the element

Returns: `void`

**Throws**

An error if the provided value is invalid.  
Inherited from [AbstractFormInputElement._setValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_setvalue)

---

### create

```typescript
static create(config: FormInputConfig): HTMLColorPickerElement
```

Create a `HTMLColorPickerElement` using provided configuration data.

**Parameters**

- **config**: `FormInputConfig`

**Returns**

- `HTMLColorPickerElement`