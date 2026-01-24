# HTMLStringTagsElement | Foundry Virtual Tabletop - API Documentation - Version 13

A custom HTML element which allows for arbitrary assignment of a set of string tags. This element may be used directly or subclassed to impose additional validation or functionality.

## Hierarchy

- [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html)  
- **HTMLStringTagsElement**

---

## Constructors

### constructor

```typescript
new HTMLStringTagsElement(
  options?: HTMLStringTagsOptions,
): HTMLStringTagsElement
```

**Parameters**

- **options**: `HTMLStringTagsOptions` = `{}` (Optional)  
  Optional configuration options for the element.

**Returns:** `HTMLStringTagsElement`

Overrides `AbstractFormInputElement.constructor`.

---

## Properties

### _value

```typescript
_value: Set<any>
```

Inherited from [AbstractFormInputElement._value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_value).

### _internals

```typescript
_internals: ElementInternals
```

Attached ElementInternals which provides form handling functionality.  
Inherited from [AbstractFormInputElement._internals](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_internals).

### _primaryInput

```typescript
_primaryInput: HTMLElement
```

The primary input (if any). Used to determine what element should receive focus when an associated label is clicked on.  
Inherited from [AbstractFormInputElement._primaryInput](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_primaryinput).

---

## Static Properties

### formAssociated

```typescript
static formAssociated: boolean = true
```

Declare that this custom element provides form element functionality.  
Inherited from [AbstractFormInputElement.formAssociated](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#formassociated).

### observedAttributes

```typescript
static observedAttributes: string[] = [...]
```

Attributes requiring change notifications.  
Inherited from [AbstractFormInputElement.observedAttributes](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#observedattributes).

### tagName

```typescript
static tagName: string = "string-tags"
```

Overrides `AbstractFormInputElement.tagName`.

---

## Accessors

### disabled

```typescript
get disabled(): boolean
```

Is this element disabled?

**Returns:** `boolean`

Inherited from `AbstractFormInputElement.disabled`.

### editable

```typescript
get editable(): boolean
```

Is this field editable? The field can be neither disabled nor readonly.

**Returns:** `boolean`

Inherited from `AbstractFormInputElement.editable`.

### form

```typescript
get form(): HTMLFormElement
```

The form this element belongs to.

**Returns:** `HTMLFormElement`

Inherited from `AbstractFormInputElement.form`.

### name

```typescript
get name(): string
```

The input element name.

**Returns:** `string`

Inherited from `AbstractFormInputElement.name`.

### value

```typescript
get value(): FormInputValueType
```

The value of the input element.

**Returns:** `FormInputValueType`

Inherited from `AbstractFormInputElement.value`.

---

## Methods

### _activateListeners()

```typescript
_activateListeners(): void
```

Overrides [AbstractFormInputElement._activateListeners](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_activatelisteners).

**Returns:** `void`

---

### _buildElements()

```typescript
_buildElements(): (HTMLDivElement | HTMLButtonElement)[]
```

Overrides [AbstractFormInputElement._buildElements](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_buildelements).

**Returns:** An array of `HTMLDivElement` or `HTMLButtonElement`.

---

### _getValue()

```typescript
_getValue(): any[]
```

Overrides [AbstractFormInputElement._getValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_getvalue).

**Returns:** `any[]`

---

### _refresh()

```typescript
_refresh(): void
```

Overrides [AbstractFormInputElement._refresh](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_refresh).

**Returns:** `void`

---

### _setValue(value: any)

```typescript
_setValue(value: any): void
```

Overrides [AbstractFormInputElement._setValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_setvalue).

**Parameters**

- **value**: `any`

**Returns:** `void`

---

### _toggleDisabled(disabled: any)

```typescript
_toggleDisabled(disabled: any): void
```

Overrides [AbstractFormInputElement._toggleDisabled](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_toggledisabled).

**Parameters**

- **disabled**: `any`

**Returns:** `void`

---

### attributeChangedCallback(attrName: string, oldValue: null | string, newValue: null | string)

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
  The name of the attribute.
- **oldValue**: `null | string`  
  The old value: null indicates the attribute was not present.
- **newValue**: `null | string`  
  The new value: null indicates the attribute is removed.

**Returns:** `void`

Inherited from [AbstractFormInputElement.attributeChangedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#attributechangedcallback).

---

### connectedCallback()

```typescript
connectedCallback(): void
```

Initialize the custom element, constructing its HTML.

**Returns:** `void`

Inherited from [AbstractFormInputElement.connectedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#connectedcallback).

---

### _initializeTags(values?: string[])

```typescript
protected _initializeTags(values?: string[]): void
```

Initialize innerText or an initial value attribute of the element as a comma-separated list of currently assigned string tags.

**Parameters**

- **values**: `string[]` (Optional)  
  An array of initial values.

**Returns:** `void`

---

### _onClick(event: PointerEvent)

```typescript
protected _onClick(event: PointerEvent): void
```

Special handling when the custom element is clicked. This should be implemented to transfer focus to an appropriate internal element.

**Parameters**

- **event**: `PointerEvent`

**Returns:** `void`

Inherited from [AbstractFormInputElement._onClick](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_onclick).

---

### _validateTag(tag: string)

```typescript
protected _validateTag(tag: string): void
```

Subclasses may impose more strict validation on what tags are allowed.

**Parameters**

- **tag**: `string`  
  A candidate tag.

**Returns:** `void`

**Throws:** An error if the candidate tag is not allowed.

---

### create(config: FormInputConfig & StringTagsInputConfig)

```typescript
static create(config: FormInputConfig & StringTagsInputConfig): HTMLStringTagsElement
```

Create a HTMLStringTagsElement using provided configuration data.

**Parameters**

- **config**: `FormInputConfig & StringTagsInputConfig`  
  Configuration for the input element.

**Returns:** `HTMLStringTagsElement`

---

### renderTag(tag: string, label?: string, editable?: boolean)

```typescript
static renderTag(tag: string, label?: string, editable?: boolean = true): HTMLDivElement
```

Render the tagged string as an HTML element.

**Parameters**

- **tag**: `string`  
  The raw tag value.
- **label**: `string` (Optional)  
  An optional tag label.
- **editable**: `boolean` = `true` (Optional)  
  Is the tag editable?

**Returns:** `HTMLDivElement`  
A rendered HTML element for the tag.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)