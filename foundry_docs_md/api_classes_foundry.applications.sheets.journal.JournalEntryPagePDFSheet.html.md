# JournalEntryPagePDFSheet | Foundry Virtual Tabletop - API Documentation - Version 13

An Application responsible for displaying and editing a single pdf-type JournalEntryPage Document.

## Hierarchy
- [JournalEntryPageHandlebarsSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html)
- **JournalEntryPagePDFSheet**

---

## Constructors

### constructor

```typescript
new JournalEntryPagePDFSheet(
    options: any,
    ...args: any[],
): JournalEntryPagePDFSheet
```

**Parameters:**

- **options**: `any`
- **...args**: `any[]`

**Returns:**  
`JournalEntryPagePDFSheet`

_Inherited from_ [JournalEntryPageHandlebarsSheet.constructor](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#constructor)

---

## Properties

### isV2

`boolean` = ...

Indicates that the sheet renders with App V2 rather than V1.

_Inherited from_ [JournalEntryPageHandlebarsSheet.isV2](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#isV2)

### toc

`Record<string, JournalEntryPageHeading>`

The table of contents for this text page.

_Inherited from_ [JournalEntryPageHandlebarsSheet.toc](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#toc)

### BASE_APPLICATION (static)

`typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base application. Any DEFAULT_OPTIONS of super-classes further upstream of the BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the BASE_APPLICATION are not dispatched.

_Inherited from_ [JournalEntryPageHandlebarsSheet.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#BASE_APPLICATION)

### DEFAULT_OPTIONS (static)

```typescript
{
  classes: string[];
  window: { icon: string }
} = ...
```

Overrides JournalEntryPageHandlebarsSheet.DEFAULT_OPTIONS

### EDIT_PARTS (static)

```typescript
{
  content: { classes: string[]; template: string };
  footer: HandlebarsTemplatePart;
  header: HandlebarsTemplatePart;
} = ...
```

_Overrides_ JournalEntryPageHandlebarsSheet.EDIT_PARTS

### emittedEvents (static)

```typescript
readonly [unknown, "closeView"] = ...
```

_Inherited from_ [JournalEntryPageHandlebarsSheet.emittedEvents](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#emittedEvents)

### isV2 (static)

`boolean = true`

Indicates that the sheet renders with App V2 rather than V1.

_Inherited from_ [JournalEntryPageHandlebarsSheet.isV2 (static)](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#isV2)

### RENDER_STATES (static)

`Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

_Inherited from_ [JournalEntryPageHandlebarsSheet.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#RENDER_STATES)

### TABS (static)

`Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.

_Inherited from_ [JournalEntryPageHandlebarsSheet.TABS](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#TABS)

### VIEW_PARTS (static)

```typescript
{
  content: { root: boolean; template: string }
} = ...
```

_Overrides_ JournalEntryPageHandlebarsSheet.VIEW_PARTS

### _sizes (static, protected)

`Record<string, number> = {}`

Maintain a cache of PDF sizes to avoid making HEAD requests every render.

### isView (accessor)

```typescript
get isView(): boolean
```

Whether the sheet is in view mode.

**Returns:**  
`boolean`

_Inherited from_ [JournalEntryPageHandlebarsSheet.isView](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#isView)

### page (accessor)

```typescript
get page(): documents.JournalEntryPage
```

The JournalEntryPage for this sheet.

**Returns:**  
`documents.JournalEntryPage`

_Inherited from_ [JournalEntryPageHandlebarsSheet.page](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#page)

---

## Methods

### _configureRenderParts

```typescript
_configureRenderParts(options: any): any
```

**Parameters:**

- **options**: `any`

**Returns:**  
`any`

_Inherited from_ [JournalEntryPageHandlebarsSheet._configureRenderParts](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#_configureRenderParts)

---

### _insertElement

```typescript
_insertElement(element: any): void
```

**Parameters:**

- **element**: `any`

**Returns:**  
`void`

_Inherited from_ [JournalEntryPageHandlebarsSheet._insertElement](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#_insertElement)

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters:**

- **context**: `any`
- **options**: `any`

**Returns:**  
`Promise<void>`

_Overrides_ [JournalEntryPageHandlebarsSheet._onRender](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#_onRender)

---

### _prepareContentContext

```typescript
_prepareContentContext(context: any, options: any): Promise<void>
```

**Parameters:**

- **context**: `any`
- **options**: `any`

**Returns:**  
`Promise<void>`

_Overrides_ [JournalEntryPageHandlebarsSheet._prepareContentContext](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#_prepareContentContext)

---

### _prepareContext

```typescript
_prepareContext(options: any): Promise<any>
```

**Parameters:**

- **options**: `any`

**Returns:**  
`Promise<any>`

_Inherited from_ [JournalEntryPageHandlebarsSheet._prepareContext](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#_prepareContext)

---

### _preparePartContext

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```

**Parameters:**

- **partId**: `any`
- **context**: `any`
- **options**: `any`

**Returns:**  
`Promise<any>`

_Inherited from_ [JournalEntryPageHandlebarsSheet._preparePartContext](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#_preparePartContext)

---

### _prepareSubmitData

```typescript
_prepareSubmitData(event: any, form: any, formData: any, updateData: any): any
```

**Parameters:**

- **event**: `any`
- **form**: `any`
- **formData**: `any`
- **updateData**: `any`

**Returns:**  
`any`

_Inherited from_ [JournalEntryPageHandlebarsSheet._prepareSubmitData](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#_prepareSubmitData)

---

### _getViewerParams (protected)

```typescript
_getViewerParams(): URLSearchParams
```

Marshall URL query parameters to pass to the PDF viewer.

**Returns:**  
`URLSearchParams`

---

### _onCloseView (protected)

```typescript
_onCloseView(): void
```

Actions performed when this sheet is closed in some parent view.

**Returns:**  
`void`

_Inherited from_ [JournalEntryPageHandlebarsSheet._onCloseView](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#_onCloseView)

---

### _onLoadPDF (protected)

```typescript
_onLoadPDF(event: PointerEvent): void
```

Handle a request to load a PDF.

**Parameters:**

- **event**: `PointerEvent` — The triggering event.

**Returns:**  
`void`

---

### _prepareFooterContext (protected)

```typescript
_prepareFooterContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for the footer part.

**Parameters:**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)
- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)

**Returns:**  
`Promise<void>`

_Inherited from_ [JournalEntryPageHandlebarsSheet._prepareFooterContext](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#_prepareFooterContext)

---

### _prepareHeaderContext (protected)

```typescript
_prepareHeaderContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for the header part.

**Parameters:**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)
- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)

**Returns:**  
`Promise<void>`

_Inherited from_ [JournalEntryPageHandlebarsSheet._prepareHeaderContext](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#_prepareHeaderContext)

---

### _prepareHeadingLevels (protected)

```typescript
_prepareHeadingLevels(): Record<string, string>
```

Prepare heading level choices.

**Returns:**  
`Record<string, string>`

_Inherited from_ [JournalEntryPageHandlebarsSheet._prepareHeadingLevels](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#_prepareHeadingLevels)

---

### inheritanceChain (static)

```typescript
inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

**Returns:**  
`Generator<typeof ApplicationV2, void, unknown>`

**See:**  
[ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

_Inherited from_ [JournalEntryPageHandlebarsSheet.inheritanceChain](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#inheritanceChain)

---

### parseCSSDimension (static)

```typescript
parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters:**

- **style**: `string` — The CSS style rule
- **parentDimension**: `number` — The relevant dimension of the parent element

**Returns:**  
`number | void` — The parsed style dimension in pixels.

_Inherited from_ [JournalEntryPageHandlebarsSheet.parseCSSDimension](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#parseCSSDimension)

---

### waitForImages (static)

```typescript
waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters:**

- **element**: `HTMLElement` — The element.

**Returns:**  
`Promise<void>`

_Inherited from_ [JournalEntryPageHandlebarsSheet.waitForImages](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet.html#waitForImages)