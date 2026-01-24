# HTMLProseMirrorElement | Foundry Virtual Tabletop - API Documentation - Version 13

A custom HTML element responsible for displaying a ProseMirror rich text editor.

---

## Events

- **open**  
  Fired when an editor is initialized in the DOM and ready.

- **close**  
  Fired when a toggled editor is deactivated.

- **save**  
  Fired when the editor is saved.

- **plugins**  
  Fired when an editor's plugins are being configured.

---

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.elements.HTMLProseMirrorElement)  
* AbstractFormInputElement  
* **HTMLProseMirrorElement**

---

## Properties

### Protected

- **_internals**: `ElementInternals`  
  Attached ElementInternals which provides form handling functionality.  
  Inherited from [AbstractFormInputElement._internals](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_internals)

- **_primaryInput**: `HTMLElement`  
  The primary input (if any). Used to determine what element should receive focus when an associated label is clicked on.  
  Inherited from [AbstractFormInputElement._primaryInput](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_primaryinput)

### Protected Accessors

- **_value**: `string`  
  The underlying value of the element.  
  Inherited from [AbstractFormInputElement._value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_value)

### Static

- **formAssociated**: `boolean = true`  
  Declare that this custom element provides form element functionality.  
  Inherited from [AbstractFormInputElement.formAssociated](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#formassociated)

- **observedAttributes**: `string[] = ...`  
  Attributes requiring change notifications.  
  Overrides [AbstractFormInputElement.observedAttributes](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#observedattributes)

- **tagName**: `string = "prose-mirror"`  
  Overrides [AbstractFormInputElement.tagName](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#tagname)

---

## Accessors

- **disabled**  
  ```typescript
  get disabled(): boolean
  ```
  Is this element disabled?  
  Returns `boolean`  
  Inherited from [AbstractFormInputElement.disabled](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#disabled)

- **editable**  
  ```typescript
  get editable(): boolean
  ```
  Is this field editable? The field can be neither disabled nor readonly.  
  Returns `boolean`  
  Inherited from [AbstractFormInputElement.editable](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#editable)

- **form**  
  ```typescript
  get form(): HTMLFormElement
  ```
  The form this element belongs to.  
  Returns `HTMLFormElement`  
  Inherited from [AbstractFormInputElement.form](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#form)

- **name**  
  ```typescript
  get name(): string
  ```
  The input element name.  
  Returns `string`  
  Inherited from [AbstractFormInputElement.name](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#name)

- **open**  
  ```typescript
  get open(): boolean
  ```
  Whether the editor is currently open. Always true for non-toggled editors.  
  Returns `boolean`

- **value**  
  ```typescript
  get value(): FormInputValueType
  ```
  The value of the input element.  
  Returns `FormInputValueType`  
  Inherited from [AbstractFormInputElement.value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#value)

---

## Methods

### _activateListeners

```typescript
_activateListeners(): void
```
Overrides [AbstractFormInputElement._activateListeners](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_activatelisteners)  
Returns `void`

---

### _buildElements

```typescript
_buildElements(): (HTMLDivElement | HTMLButtonElement)[]
```
Overrides [AbstractFormInputElement._buildElements](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_buildelements)  
Returns array of HTMLDivElement or HTMLButtonElement

---

### _getValue

```typescript
_getValue(): string
```
Overrides [AbstractFormInputElement._getValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_getvalue)  
Returns `string`

---

### _refresh

```typescript
_refresh(): void
```
Overrides [AbstractFormInputElement._refresh](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_refresh)  
Returns `void`

---

### _toggleDisabled

```typescript
_toggleDisabled(disabled: any): void
```

**Parameters**

- **disabled**: `any`

Overrides [AbstractFormInputElement._toggleDisabled](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_toggledisabled)  
Returns `void`

---

### attributeChangedCallback

```typescript
attributeChangedCallback(attrName: any, oldValue: any, newValue: any): void
```

Fires a callback on change to an observed attribute.

**Parameters**

- **attrName**: `any`  
  The name of the attribute
- **oldValue**: `any`  
  The old value: `null` indicates the attribute was not present.
- **newValue**: `any`  
  The new value: `null` indicates the attribute is removed.

Overrides [AbstractFormInputElement.attributeChangedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#attributechangedcallback)  
Returns `void`

---

### connectedCallback

```typescript
connectedCallback(): void
```

Initialize the custom element, constructing its HTML.  
Inherited from [AbstractFormInputElement.connectedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#connectedcallback)  
Returns `void`

---

### disconnectedCallback

```typescript
disconnectedCallback(): void
```

Actions to take when the custom element is removed from the document.  
Returns `void`

---

### isDirty

```typescript
isDirty(): boolean
```

Determine if the editor has unsaved changes.  
Returns `boolean`

---

### _configurePlugins

```typescript
protected _configurePlugins(): Record<string, Plugin<any>>
```

Configure ProseMirror editor plugins.  
Returns `Record<string, Plugin<any>>`

---

### _onClick

```typescript
protected _onClick(event: PointerEvent): void
```

Special handling when the custom element is clicked. This should be implemented to transfer focus to an appropriate internal element.

**Parameters**

- **event**: `PointerEvent`

Returns `void`  
Inherited from [AbstractFormInputElement._onClick](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_onclick)

---

### _setValue

```typescript
protected _setValue(value: string): void
```

Translate user-provided input value into the format that should be stored.

**Parameters**

- **value**: `string`  
  A new value to assign to the element

**Throws**  
An error if the provided value is invalid

Inherited from [AbstractFormInputElement._setValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_setvalue)  
Returns `void`

---

### Static create

```typescript
static create(config: FormInputConfig & ProseMirrorInputConfig): HTMLProseMirrorElement
```

Create a `HTMLProseMirrorElement` using provided configuration data.

**Parameters**

- **config**: [`FormInputConfig`](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html) & [`ProseMirrorInputConfig`](https://foundryvtt.com/api/interfaces/foundry.ProseMirrorInputConfig.html)

Returns `HTMLProseMirrorElement`