# HTMLCodeMirrorElement | Foundry Virtual Tabletop - API Documentation - Version 13

A custom HTML element responsible for displaying a CodeMirror rich text editor.

## Hierarchy

- [AbstractFormInputElement](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html)  
- **HTMLCodeMirrorElement**

---

## Constructors

### constructor

```typescript
new HTMLCodeMirrorElement(
    options?: HTMLCodeMirrorOptions,
): HTMLCodeMirrorElement
```

**Parameters**

- **options**?: `HTMLCodeMirrorOptions` = {}

**Returns**  
`HTMLCodeMirrorElement`

Overrides `AbstractFormInputElement.constructor`

`HTMLCodeMirrorOptions` interface reference: [HTMLCodeMirrorOptions](https://foundryvtt.com/api/interfaces/foundry.HTMLCodeMirrorOptions.html)

---

## Properties

### Protected

- **_internals**: `ElementInternals`  
  Attached ElementInternals which provides form handling functionality.  
  (Inherited from [AbstractFormInputElement._internals](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_internals))

- **_primaryInput**: `HTMLElement`  
  The primary input (if any). Used to determine what element should receive focus when an associated label is clicked on.  
  (Inherited from [AbstractFormInputElement._primaryInput](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_primaryinput))

- **_value**: `string`  
  The underlying value of the element.  
  (Inherited from [AbstractFormInputElement._value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_value))

### Static

- **formAssociated**: `boolean` = true  
  Declare that this custom element provides form element functionality.  
  (Inherited from [AbstractFormInputElement.formAssociated](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#formassociated))

- **observedAttributes**: `string[]` = ...  
  Attributes requiring change notifications  
  Overrides [AbstractFormInputElement.observedAttributes](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#observedattributes)

- **tagName**: `"code-mirror"`  
  Overrides [AbstractFormInputElement.tagName](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#tagname)

---

## Accessors

### disabled

```typescript
get disabled(): boolean
```

Is this element disabled?

**Returns**  
`boolean`

(Inherited from AbstractFormInputElement.disabled)

---

### editable

```typescript
get editable(): boolean
```

Is this field editable? The field can be neither disabled nor readonly.

**Returns**  
`boolean`

(Inherited from AbstractFormInputElement.editable)

---

### form

```typescript
get form(): HTMLFormElement
```

The form this element belongs to.

**Returns**  
`HTMLFormElement`

(Inherited from AbstractFormInputElement.form)

---

### indent

```typescript
get indent(): number
set indent(value: number): void
```

This element's indent attribute, which determines the number of spaces added upon pressing the TAB key. A value of 0 disables this feature entirely.

**Parameters**

- **value**: `number` - Set this element's indent attribute.

**Returns**  
`number` (getter)  
`void` (setter)

---

### language

```typescript
get language(): CodeMirrorLanguage
set language(value: CodeMirrorLanguage): void
```

This element's language attribute or its default if no value is set.

**Parameters**

- **value**: `CodeMirrorLanguage` - Set this element's language attribute.

**Returns**  
`CodeMirrorLanguage` (getter)  
`void` (setter)

Reference type: [CodeMirrorLanguage](https://foundryvtt.com/api/types/foundry.data.types.CodeMirrorLanguage.html)

---

### managed

```typescript
get managed(): boolean
set managed(value: boolean): void
```

Whether the editor is externally managed by some other process that takes responsibility for its contents and for firing events. If not set, the editor will fire its own events.

**Parameters**

- **value**: `boolean` - Set the editor's managed attribute.

**Returns**  
`boolean` (getter)  
`void` (setter)

---

### name

```typescript
get name(): string
```

The input element name.

**Returns**  
`string`

(Inherited from AbstractFormInputElement.name)

---

### nowrap

```typescript
get nowrap(): boolean
set nowrap(value: boolean): void
```

The element's nowrap attribute, which if present disables line-wrapping.

**Parameters**

- **value**: `boolean` - Set this element's nowrap attribute.

**Returns**  
`boolean` (getter)  
`void` (setter)

---

### value

```typescript
get value(): FormInputValueType
```

The value of the input element.

**Returns**  
`FormInputValueType`

(Inherited from [AbstractFormInputElement.value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#forminputvaluetype))

Reference type: [FormInputValueType](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#forminputvaluetype)

---

## Methods

### _buildElements

```typescript
_buildElements(): HTMLElement[]
```

**Returns**  
`HTMLElement[]`

Overrides [_buildElements](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_buildelements) in `AbstractFormInputElement`

---

### _getValue

```typescript
_getValue(): string
```

**Returns**  
`string`

Overrides [_getValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_getvalue) in `AbstractFormInputElement`

---

### _setValue

```typescript
_setValue(value: any): void
```

Translate user-provided input value into the format that should be stored.

**Parameters**

- **value**: `any` - A new value to assign to the element

**Returns**  
`void`

**Throws**  
An error if the provided value is invalid.

Overrides [_setValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_setvalue) in `AbstractFormInputElement`

---

### attributeChangedCallback

```typescript
attributeChangedCallback(attrName: any, oldValue: any, newValue: any): void
```

Fire a callback on change to an observed attribute.

**Parameters**

- **attrName**: `any` - The name of the attribute  
- **oldValue**: `any` - The old value: `null` indicates the attribute was not present.  
- **newValue**: `any` - The new value: `null` indicates the attribute is removed.

**Returns**  
`void`

Overrides [attributeChangedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#attributechangedcallback) in `AbstractFormInputElement`

---

### connectedCallback

```typescript
connectedCallback(): void
```

Initialize the custom element, constructing its HTML.

**Returns**  
`void`

Overrides [connectedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#connectedcallback) in `AbstractFormInputElement`

---

### disconnectedCallback

```typescript
disconnectedCallback(): void
```

Call for garbage collection upon this element being removed from the DOM.

**Returns**  
`void`

---

### posAtCoords

```typescript
posAtCoords(coords: Point): number
```

Given screen co-ordinates, returns the position in the editor's text content at those coordinates.

**Parameters**

- **coords**: `Point` - The screen co-ordinates.

**Returns**  
`number`

Reference interface: [Point](https://foundryvtt.com/api/interfaces/foundry.types.Point.html)

---

### _activateListeners

```typescript
protected _activateListeners(): void
```

Activate event listeners which add dynamic behavior to the custom element.

**Returns**  
`void`

(Inherited from [AbstractFormInputElement._activateListeners](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_activatelisteners))

---

### _onClick

```typescript
protected _onClick(event: PointerEvent): void
```

Special handling when the custom element is clicked. This should be implemented to transfer focus to an appropriate internal element.

**Parameters**

- **event**: `PointerEvent`

**Returns**  
`void`

(Inherited from [AbstractFormInputElement._onClick](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_onclick))

---

### _refresh

```typescript
protected _refresh(): void
```

Refresh the active state of the custom element.

**Returns**  
`void`

(Inherited from [AbstractFormInputElement._refresh](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_refresh))

---

### _toggleDisabled

```typescript
protected _toggleDisabled(disabled: boolean): void
```

**Parameters**

- **disabled**: `boolean`

**Returns**  
`void`

Overrides [AbstractFormInputElement._toggleDisabled](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_toggledisabled)

---

### create (Static)

```typescript
static create(
    config: FormInputConfig<string> & CodeMirrorInputConfig,
): HTMLCodeMirrorElement
```

Create an HTMLCodeMirrorElement element for a StringField (typically a JSONField or JavascriptField).

**Parameters**

- **config**: `FormInputConfig<string>` & `CodeMirrorInputConfig`

**Returns**  
`HTMLCodeMirrorElement`

Reference interfaces:  
- [FormInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.FormInputConfig.html)  
- [CodeMirrorInputConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.CodeMirrorInputConfig.html)