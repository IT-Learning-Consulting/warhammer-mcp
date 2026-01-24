# HTMLDocumentTagsElement | Foundry Virtual Tabletop - API Documentation - Version 13

A custom HTMLElement used to render a set of associated Documents referenced by UUID.

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.elements.HTMLDocumentTagsElement))

- *AbstractFormInputElement*  
- **HTMLDocumentTagsElement**

---

## Constructors

### constructor

```typescript
new HTMLDocumentTagsElement(
    options?: HTMLDocumentTagsOptions,
): HTMLDocumentTagsElement
```

**Parameters**

- **options**?: `HTMLDocumentTagsOptions` = {}

**Returns**  
`HTMLDocumentTagsElement`

Overrides `AbstractFormInputElement.constructor`

---

## Properties

### _internals

`_internals: ElementInternals`

Attached ElementInternals which provides form handling functionality.

Inherited from [AbstractFormInputElement._internals](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_internals)

---

### _primaryInput

`_primaryInput: HTMLElement`

The primary input (if any). Used to determine what element should receive focus when an associated label is clicked on.

Inherited from [AbstractFormInputElement._primaryInput](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_primaryinput)

---

### _value

`_value: Record<string, string> = {}`

Overrides [AbstractFormInputElement._value](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_value)

---

### Static Properties

#### formAssociated

`formAssociated: boolean = true`

Declare that this custom element provides form element functionality.

Inherited from [AbstractFormInputElement.formAssociated](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#formassociated)

---

#### observedAttributes

`observedAttributes: string[] = [...]`

Attributes requiring change notifications.

Inherited from [AbstractFormInputElement.observedAttributes](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#observedattributes)

---

#### tagName

`tagName: string = "document-tags"`

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

Inherited from `AbstractFormInputElement.disabled`

---

### editable

```typescript
get editable(): boolean
```

Is this field editable? The field can be neither disabled nor readonly.

**Returns**  
`boolean`

Inherited from `AbstractFormInputElement.editable`

---

### form

```typescript
get form(): HTMLFormElement
```

The form this element belongs to.

**Returns**  
`HTMLFormElement`

Inherited from `AbstractFormInputElement.form`

---

### max

```typescript
get max(): number
```

Allow a maximum number of documents to be tagged to the element.

**Returns**  
`number`

---

### name

```typescript
get name(): string
```

The input element name.

**Returns**  
`string`

Inherited from `AbstractFormInputElement.name`

---

### single

```typescript
get single(): boolean
```

Restrict to only allow referencing a single Document instead of an array of documents.

**Returns**  
`boolean`

---

### type

```typescript
get type(): null | string
```

Restrict this element to documents of a particular type.

**Returns**  
`null | string`

---

### value

```typescript
get value(): FormInputValueType
```

The value of the input element.

**Returns**  
`FormInputValueType`

Inherited from `AbstractFormInputElement.value`

---

## Methods

### _activateListeners

```typescript
_activateListeners(): void
```

Overrides [AbstractFormInputElement._activateListeners](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_activatelisteners)

---

### _buildElements

```typescript
_buildElements(): (HTMLDivElement | HTMLButtonElement)[]
```

Overrides [AbstractFormInputElement._buildElements](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_buildelements)

---

### _getValue

```typescript
_getValue(): string | string[]
```

Overrides [AbstractFormInputElement._getValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_getvalue)

---

### _refresh

```typescript
_refresh(): void
```

Overrides [AbstractFormInputElement._refresh](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_refresh)

---

### _setValue

```typescript
_setValue(value: any): void
```

**Parameters**

- **value**: `any`

Overrides [AbstractFormInputElement._setValue](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_setvalue)

---

### _toggleDisabled

```typescript
_toggleDisabled(disabled: any): void
```

**Parameters**

- **disabled**: `any`

Overrides [AbstractFormInputElement._toggleDisabled](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_toggledisabled)

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

- **attrName**: `string` — The name of the attribute  
- **oldValue**: `null | string` — The old value: null indicates the attribute was not present.  
- **newValue**: `null | string` — The new value: null indicates the attribute is removed.

**Returns**  
`void`

Inherited from [AbstractFormInputElement.attributeChangedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#attributechangedcallback)

---

### connectedCallback

```typescript
connectedCallback(): void
```

Initialize the custom element, constructing its HTML.

**Returns**  
`void`

Inherited from [AbstractFormInputElement.connectedCallback](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#connectedcallback)

---

### _initializeTags

```typescript
protected _initializeTags(values?: string[]): void
```

Initialize innerText or an initial value attribute of the element as a serialized JSON array.

**Parameters**

- **values**?: `string[]` — An array of Document UUIDs to initialize the element with.

**Returns**  
`void`

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

Inherited from [AbstractFormInputElement._onClick](https://foundryvtt.com/api/classes/foundry.applications.elements.AbstractFormInputElement.html#_onclick)

---

### create

```typescript
static create(
    config: FormInputConfig & DocumentTagsInputConfig,
): HTMLDocumentTagsElement
```

Create a HTMLDocumentTagsElement using provided configuration data.

**Parameters**

- **config**: `FormInputConfig & DocumentTagsInputConfig`

**Returns**  
`HTMLDocumentTagsElement`

---

### renderTag

```typescript
static renderTag(uuid: string, name: string, editable?: boolean): HTMLDivElement
```

Create an HTML string fragment for a single document tag.

**Parameters**

- **uuid**: `string` — The document UUID  
- **name**: `string` — The document name  
- **editable**?: `boolean` = `true` — Is the tag editable?

**Returns**  
`HTMLDivElement`

---

**See also:** [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)