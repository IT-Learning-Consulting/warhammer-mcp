# AbstractMultiSelectElement | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract base class designed to standardize the behavior for a multi-select UI component. Multi-select components return an array of values as part of form submission. Different implementations may provide different experiences around how inputs are presented to the user.

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.elements.AbstractMultiSelectElement), Expand)

- _AbstractFormInputElement_  
- **AbstractMultiSelectElement**  
- _HTMLMultiSelectElement_  
- _HTMLMultiCheckboxElement_

## Properties

### _value

```typescript
_value: Set<any> = ...
```

Overrides [_value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_value) from [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### _choices

```typescript
_choices: Record<string, string> = {}
```

An object which maps option values to displayed labels.

---

### _internals

```typescript
_internals: ElementInternals
```

Attached ElementInternals which provides form handling functionality.

Inherited from [_internals](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_internals) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### _options

```typescript
_options: (HTMLOptionElement | HTMLOptGroupElement)[] = []
```

Predefined options and groups.

---

### _primaryInput

```typescript
_primaryInput: HTMLElement
```

The primary input (if any). Used to determine what element should receive focus when an associated label is clicked on.

Inherited from [_primaryInput](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_primaryinput) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### formAssociated (static)

```typescript
static formAssociated: boolean = true
```

Declare that this custom element provides form element functionality.

Inherited from [formAssociated](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#formassociated) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### observedAttributes (static)

```typescript
static observedAttributes: string[] = ...
```

Attributes requiring change notifications.

Inherited from [observedAttributes](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#observedattributes) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### tagName (static)

```typescript
static tagName: string
```

The HTML tag name used by this element.

Inherited from [tagName](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#tagname) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

## Accessors

### disabled

```typescript
get disabled(): boolean
```

Is this element disabled?

Returns: `boolean`

Inherited from [disabled](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#disabled) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### editable

```typescript
get editable(): boolean
```

Is this field editable? The field can be neither disabled nor readonly.

Returns: `boolean`

Inherited from [editable](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#editable) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### form

```typescript
get form(): HTMLFormElement
```

The form this element belongs to.

Returns: `HTMLFormElement`

Inherited from [form](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#form) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### name

```typescript
get name(): string
```

The input element name.

Returns: `string`

Inherited from [name](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#name) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### value

```typescript
get value(): FormInputValueType
```

The value of the input element.

Returns: `FormInputValueType`

Inherited from [value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#value) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

## Methods

### _getValue

```typescript
_getValue(): any[]
```

Returns the current value as an array.

Returns: `any[]`

Overrides [_getValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_getvalue) from [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### _setValue

```typescript
_setValue(value: any): void
```

Set the value of the input.

**Parameters:**

- **value**: `any` - The new value to set.

Returns: `void`

Overrides [_setValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_setvalue) from [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

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

**Parameters:**

- **attrName**: `string` - The name of the attribute.
- **oldValue**: `null | string` - The old value; null indicates the attribute was not present.
- **newValue**: `null | string` - The new value; null indicates the attribute is removed.

Returns: `void`

Inherited from [attributeChangedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#attributechangedcallback) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### connectedCallback

```typescript
connectedCallback(): void
```

Initialize the custom element, constructing its HTML.

Returns: `void`

Overrides [connectedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#connectedcallback) from [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### select

```typescript
select(value: string): void
```

Mark a choice as selected.

**Parameters:**

- **value**: `string` - The value to add to the chosen set.

Returns: `void`

---

### unselect

```typescript
unselect(value: string): void
```

Mark a choice as un-selected.

**Parameters:**

- **value**: `string` - The value to delete from the chosen set.

Returns: `void`

---

### _activateListeners (protected)

```typescript
_activateListeners(): void
```

Activate event listeners which add dynamic behavior to the custom element.

Returns: `void`

Inherited from [_activateListeners](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_activatelisteners) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### _buildElements (protected)

```typescript
_buildElements(): HTMLElement[]
```

Create the HTML elements that should be included in this custom element. Elements are returned as an array of ordered children.

Returns: `HTMLElement[]`

Inherited from [_buildElements](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_buildelements) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### _initialize (protected)

```typescript
_initialize(): void
```

Preserve existing internal state and initialize.

Returns: `void`

---

### _onClick (protected)

```typescript
_onClick(event: PointerEvent): void
```

Special handling when the custom element is clicked. This should be implemented to transfer focus to an appropriate internal element.

**Parameters:**

- **event**: `PointerEvent` - The click event.

Returns: `void`

Inherited from [_onClick](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_onclick) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### _refresh (protected)

```typescript
_refresh(): void
```

Refresh the active state of the custom element.

Returns: `void`

Inherited from [_refresh](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_refresh) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

### _toggleDisabled (protected)

```typescript
_toggleDisabled(disabled: boolean): void
```

Special behaviors that the subclass should implement when toggling the disabled state of the input.

**Parameters:**

- **disabled**: `boolean` - The new disabled state.

Returns: `void`

Inherited from [_toggleDisabled](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_toggledisabled) in [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html).

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)