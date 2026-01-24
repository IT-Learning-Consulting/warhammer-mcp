# TokenConfig | Foundry Virtual Tabletop - API Documentation - Version 13

The Application responsible for configuring a single token document within a parent Scene

**Mixes:**  
TokenApplication

**Hierarchy:**  
any  
TokenConfig

---

## Properties

### isPrototype

- **Type:** `boolean`  
- **Default:** `false`

### _fields

- **Type:** [`DataSchema`](https://foundryvtt.com/api/types/foundry.abstract.types.DataSchema.html)  
- **Returns:** `DataSchema`

### actor

- **Type:** `any`  
- **Returns:** `any`

### isVisible

- **Type:** `any`  
- **Returns:** `any`

### token

- **Type:** `any`  
- **Returns:** `any`

---

## Methods

### _initializeTokenPreview

```typescript
_initializeTokenPreview(): Promise<void>
```

- **Returns:** `Promise<void>`

---

### _onChangeForm

```typescript
_onChangeForm(formConfig: any, event: any): void
```

- **Parameters:**
  - **formConfig:** `any`
  - **event:** `any`
- **Returns:** `void`

---

### _onClose

```typescript
_onClose(options: any): void
```

- **Parameters:**
  - **options:** `any`
- **Returns:** `void`

---

### _onRender

```typescript
_onRender(context: any, options: any): any
```

- **Parameters:**
  - **context:** `any`
  - **options:** `any`
- **Returns:** `any`

---

### _prepareAppearanceTab

```typescript
_prepareAppearanceTab(options: any): Promise<any>
```

- **Parameters:**
  - **options:** `any`
- **Returns:** `Promise<any>`

---

### _prepareContext

```typescript
_prepareContext(options: any): Promise<any>
```

- **Parameters:**
  - **options:** `any`
- **Returns:** `Promise<any>`

---

### _previewChanges

```typescript
_previewChanges(changes: any): void
```

- **Parameters:**
  - **changes:** `any`
- **Returns:** `void`

---

### _processFormData

```typescript
_processFormData(event: any, form: any, formData: any): any
```

- **Parameters:**
  - **event:** `any`
  - **form:** `any`
  - **formData:** `any`
- **Returns:** `any`

---

### _processSubmitData

```typescript
_processSubmitData(
    event: any,
    form: any,
    submitData: any,
    options: any,
): Promise<void>
```

- **Parameters:**
  - **event:** `any`
  - **form:** `any`
  - **submitData:** `any`
  - **options:** `any`
- **Returns:** `Promise<void>`

---

### _toggleDisabled

```typescript
_toggleDisabled(disabled: any): void
```

- **Parameters:**
  - **disabled:** `any`
- **Returns:** `void`

---

### _onChangeBar

```typescript
protected _onChangeBar(event: Event): void
```

- **Description:**  
  Handle changing the attribute bar in the drop-down selector to update the default current and max value.
- **Parameters:**
  - **event:** `Event` — The select input change event
- **Returns:** `void`

---

### #resetPreview

```typescript
protected "#resetPreview"(): void
```

- **Description:**  
  Reset the temporary preview of the Token when the form is submitted or closed.
- **Returns:** `void`