# HTMLHueSelectorSlider

A class designed to standardize the behavior for a hue selector UI component.

**Hierarchy:**  
[AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html)  
→ **HTMLHueSelectorSlider**

---

## Properties

### Protected

- **_internals**  
  *Type:* `ElementInternals`  
  Attached ElementInternals which provides form handling functionality.  
  _Inherited from [AbstractFormInputElement._internals](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_internals)_

- **_primaryInput**  
  *Type:* `HTMLElement`  
  The primary input (if any). Used to determine what element should receive focus when an associated label is clicked on.  
  _Inherited from [AbstractFormInputElement._primaryInput](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_primaryinput)_

- **_value**  
  *Type:* `number`  
  The underlying value of the element.  
  _Inherited from [AbstractFormInputElement._value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_value)_

### Static

- **formAssociated**  
  *Type:* `boolean` = `true`  
  Declare that this custom element provides form element functionality.  
  _Inherited from [AbstractFormInputElement.formAssociated](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#formassociated)_

---

## Accessors

### Static

- **observedAttributes**  
  *Type:* `string[]`  
  Attributes requiring change notifications.  
  _Inherited from [AbstractFormInputElement.observedAttributes](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#observedattributes)_

- **tagName**  
  *Type:* `string` = `"hue-slider"`  
  Overrides [AbstractFormInputElement.tagName](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#tagname)

### Instance

- **disabled**  
  ```typescript
  get disabled(): boolean
  ```  
  Is this element disabled?  
  _Inherited from AbstractFormInputElement.disabled_

- **editable**  
  ```typescript
  get editable(): boolean
  ```  
  Is this field editable? The field can be neither disabled nor readonly.  
  _Inherited from AbstractFormInputElement.editable_

- **form**  
  ```typescript
  get form(): HTMLFormElement
  ```  
  The form this element belongs to.  
  _Inherited from AbstractFormInputElement.form_

- **name**  
  ```typescript
  get name(): string
  ```  
  The input element name.  
  _Inherited from AbstractFormInputElement.name_

- **value**  
  ```typescript
  get value(): FormInputValueType
  ```  
  The value of the input element.  
  _Inherited from AbstractFormInputElement.value_

---

## Methods

### _buildElements

```typescript
_buildElements(): HTMLInputElement[]
```

Overrides [AbstractFormInputElement._buildElements](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_buildelements)  
**Returns:** `HTMLInputElement[]`  

---

### _setValue

```typescript
_setValue(value: any): void
```

Overrides [AbstractFormInputElement._setValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_setvalue)

**Parameters:**

- **value**: `any`

**Returns:** `void`

---

### _toggleDisabled

```typescript
_toggleDisabled(disabled: any): void
```

Overrides [AbstractFormInputElement._toggleDisabled](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_toggledisabled)

**Parameters:**

- **disabled**: `any`

**Returns:** `void`

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
_Inherited from [AbstractFormInputElement.attributeChangedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#attributechangedcallback)_

**Parameters:**

- **attrName**: `string`  
  The name of the attribute

- **oldValue**: `null | string`  
  The old value: null indicates the attribute was not present.

- **newValue**: `null | string`  
  The new value: null indicates the attribute is removed.

**Returns:** `void`

---

### connectedCallback

```typescript
connectedCallback(): void
```

Initialize the custom element, constructing its HTML.  
_Inherited from [AbstractFormInputElement.connectedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#connectedcallback)_

**Returns:** `void`

---

### _activateListeners

```typescript
_protected _activateListeners(): void
```

Activate event listeners which add dynamic behavior to the custom element.  
Overrides [AbstractFormInputElement._activateListeners](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_activatelisteners)

**Returns:** `void`

---

### _getValue

```typescript
_protected _getValue(): number
```

Return the value of the input element which should be submitted to the form.  
Inherited from [AbstractFormInputElement._getValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_getvalue)

**Returns:** `number`

---

### _onClick

```typescript
_protected _onClick(event: PointerEvent): void
```

Special handling when the custom element is clicked. This should be implemented to transfer focus to an appropriate internal element.  
Inherited from [AbstractFormInputElement._onClick](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_onclick)

**Parameters:**

- **event**: `PointerEvent`

**Returns:** `void`

---

### _refresh

```typescript
_protected _refresh(): void
```

Refresh the active state of the custom element.  
Overrides [AbstractFormInputElement._refresh](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_refresh)

**Returns:** `void`

---

### Static create

```typescript
static create(config: FormInputConfig): HTMLHueSelectorSlider
```

Create a HTMLHueSelectorSlider using provided configuration data.

**Parameters:**

- **config**: [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html)

**Returns:** `HTMLHueSelectorSlider`