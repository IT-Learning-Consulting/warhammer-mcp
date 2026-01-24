# JournalEntryPageMarkdownSheet

An Application responsible for displaying a single text-type `JournalEntryPage` Document, and editing it with a Markdown editor.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sheets.journal.JournalEntryPageMarkdownSheet)  
- *JournalEntryPageTextSheet*  
- **JournalEntryPageMarkdownSheet**

---

## Constructor

```typescript
new JournalEntryPageMarkdownSheet(
    options: any,
    ...args: any[],
): JournalEntryPageMarkdownSheet
```

**Parameters**

- **options**: `any`  
- **...args**: `any[]`

**Returns**

- `JournalEntryPageMarkdownSheet`

_Inherited from [JournalEntryPageTextSheet.constructor](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#constructor)_

---

## Properties

### isV2

`isV2: boolean = ...`

Indicates that the sheet renders with App V2 rather than V1.

_Inherited from [JournalEntryPageTextSheet.isV2](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#isV2)_

### toc

`toc: Record<string, JournalEntryPageHeading>`

The table of contents for this text page.

_Inherited from [JournalEntryPageTextSheet.toc](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#toc)_

---

## Static Properties

### BASE_APPLICATION

`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the `BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the `BASE_APPLICATION` are not dispatched.

_Inherited from [JournalEntryPageTextSheet.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#BASE_APPLICATION)_

### DEFAULT_OPTIONS

`DEFAULT_OPTIONS: { window: { contentClasses: string[]; icon: string } } = ...`

Overrides `JournalEntryPageTextSheet.DEFAULT_OPTIONS`.

### EDIT_PARTS

```typescript
EDIT_PARTS: {
    content: { classes: string[]; template: string };
    footer: HandlebarsTemplatePart;
    header: HandlebarsTemplatePart;
} = ...
```

Overrides `JournalEntryPageTextSheet.EDIT_PARTS`.

### emittedEvents

`emittedEvents: readonly [unknown, "closeView"] = ...`

_Inherited from [JournalEntryPageTextSheet.emittedEvents](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#emittedEvents)_

### format

`format: 2 = JOURNAL_ENTRY_PAGE_FORMATS.MARKDOWN`

Overrides `JournalEntryPageTextSheet.format`.

### isV2

`isV2: boolean = true`

Indicates that the sheet renders with App V2 rather than V1.

_Inherited from [JournalEntryPageTextSheet.isV2](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#isV2)_

### RENDER_STATES

`RENDER_STATES: Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

_Inherited from [JournalEntryPageTextSheet.RENDER_STATES](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#RENDER_STATES)_

### TABS

`TABS: Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.

_Inherited from [JournalEntryPageTextSheet.TABS](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#TABS)_

### VIEW_PARTS

```typescript
VIEW_PARTS: {
    content: { root: boolean; template: string }
} = ...
```

Overrides `JournalEntryPageTextSheet.VIEW_PARTS`.

### _converter

`protected static _converter: Converter = ...`

Bi-directional HTML <-> Markdown converter.

_Inherited from [JournalEntryPageTextSheet._converter](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_converter)_

---

## Accessors

### isView

```typescript
get isView(): boolean
```

Whether the sheet is in view mode.

**Returns**  
`boolean`

_Inherited from [JournalEntryPageTextSheet.isView](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#isView)_

### page

```typescript
get page(): documents.JournalEntryPage
```

The JournalEntryPage for this sheet.

_Inherited from [JournalEntryPageTextSheet.page](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#page)_

---

## Methods

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

**Returns**  
`void`

_Inherited from [JournalEntryPageTextSheet._attachFrameListeners](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_attachFrameListeners)_

---

### _configureRenderParts

```typescript
_configureRenderParts(options: any): any
```

**Parameters**

- **options**: `any`

**Returns**  
`any`

_Inherited from [JournalEntryPageTextSheet._configureRenderParts](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_configureRenderParts)_

---

### _insertElement

```typescript
_insertElement(element: any): void
```

**Parameters**

- **element**: `any`

**Returns**  
`void`

_Inherited from [JournalEntryPageTextSheet._insertElement](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_insertElement)_

---

### _isEditorDirty

```typescript
_isEditorDirty(): boolean
```

**Returns**  
`boolean`

Overrides [JournalEntryPageTextSheet._isEditorDirty](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_isEditorDirty)

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<void>`

_Inherited from [JournalEntryPageTextSheet._onRender](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_onRender)_

---

### _prepareContentContext

```typescript
_prepareContentContext(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<void>`

Overrides [JournalEntryPageTextSheet._prepareContentContext](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_prepareContentContext)

---

### _prepareContext

```typescript
_prepareContext(options: any): Promise<any>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<any>`

_Inherited from [JournalEntryPageTextSheet._prepareContext](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_prepareContext)_

---

### _preparePartContext

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```

**Parameters**

- **partId**: `any`  
- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<any>`

_Inherited from [JournalEntryPageTextSheet._preparePartContext](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_preparePartContext)_

---

### _prepareSubmitData

```typescript
_prepareSubmitData(event: any, form: any, formData: any, updateData: any): any
```

**Parameters**

- **event**: `any`  
- **form**: `any`  
- **formData**: `any`  
- **updateData**: `any`

**Returns**  
`any`

Overrides [JournalEntryPageTextSheet._prepareSubmitData](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_prepareSubmitData)

---

### _onCloseView

```typescript
_onCloseView(): void
```

Protected  
Actions performed when this sheet is closed in some parent view.

**Returns**  
`void`

_Inherited from [JournalEntryPageTextSheet._onCloseView](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_onCloseView)_

---

### _onDrop

```typescript
_onDrop(event: DragEvent): undefined | Promise<void>
```

Protected  
Handle dropping something onto the markdown editor.

**Parameters**

- **event**: `DragEvent` — The triggering event.

**Returns**  
`undefined | Promise<void>`

---

### _onDropContentLink

```typescript
_onDropContentLink(event: DragEvent, eventData: object): Promise<void>
```

Protected  
Handle dropping a content link onto the markdown editor.

**Parameters**

- **event**: `DragEvent` — The originating drop event.  
- **eventData**: `object` — The parsed event data.

**Returns**  
`Promise<void>`

---

### _prepareFooterContext

```typescript
_prepareFooterContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Protected  
Prepare render context for the footer part.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)

**Returns**  
`Promise<void>`

_Inherited from [JournalEntryPageTextSheet._prepareFooterContext](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_prepareFooterContext)_

---

### _prepareHeaderContext

```typescript
_prepareHeaderContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Protected  
Prepare render context for the header part.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)

**Returns**  
`Promise<void>`

_Inherited from [JournalEntryPageTextSheet._prepareHeaderContext](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_prepareHeaderContext)_

---

### _prepareHeadingLevels

```typescript
_prepareHeadingLevels(): Record<string, string>
```

Protected  
Prepare heading level choices.

**Returns**  
`Record<string, string>`

_Inherited from [JournalEntryPageTextSheet._prepareHeadingLevels](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#_prepareHeadingLevels)_

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

**See also:** [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

_Inherited from [JournalEntryPageTextSheet.inheritanceChain](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#inheritanceChain)_

---

### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- **style**: `string` — The CSS style rule  
- **parentDimension**: `number` — The relevant dimension of the parent element

**Returns**  
`number | void` — The parsed style dimension in pixels

_Inherited from [JournalEntryPageTextSheet.parseCSSDimension](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#parseCSSDimension)_

---

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement` — The element.

**Returns**  
`Promise<void>`

_Inherited from [JournalEntryPageTextSheet.waitForImages](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html#waitForImages)_

---

For more details, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageMarkdownSheet.html).