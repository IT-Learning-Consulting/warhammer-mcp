# JournalEntryPageTextSheet | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract Application responsible for displaying and editing a single text-type  
JournalEntryPage Document.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sheets.journal.JournalEntryPageTextSheet)  
- *JournalEntryPageHandlebarsSheet*  
- **JournalEntryPageTextSheet**  
- *JournalEntryPageMarkdownSheet*  
- *JournalEntryPageProseMirrorSheet*

## Constructors

### constructor

```typescript
new JournalEntryPageTextSheet(
    options: any,
    ...args: any[],
): JournalEntryPageTextSheet
```

**Parameters**

- **options**: `any`  
- **...args**: `any[]`  

**Returns**  
`JournalEntryPageTextSheet`

**Inherit Doc**  
Inherited from JournalEntryPageHandlebarsSheet.constructor

## Properties

### isV2

`boolean = ...`

Indicates that the sheet renders with App V2 rather than V1.

Inherited from JournalEntryPageHandlebarsSheet.isV2

### toc

`Record<string, JournalEntryPageHeading>`

The table of contents for this text page.

Inherited from JournalEntryPageHandlebarsSheet.toc

### BASE_APPLICATION

`typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any DEFAULT_OPTIONS of super-classes further upstream of the  
BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the  
BASE_APPLICATION are not dispatched.

Inherited from JournalEntryPageHandlebarsSheet.BASE_APPLICATION

### DEFAULT_OPTIONS

`{ classes: string[]; includeTOC: boolean } = ...`

Overrides JournalEntryPageHandlebarsSheet.DEFAULT_OPTIONS

### EDIT_PARTS

`Record<string, HandlebarsTemplatePart> = ...`

Handlebars parts to render in edit mode.

Inherited from JournalEntryPageHandlebarsSheet.EDIT_PARTS

### emittedEvents

`readonly [unknown, "closeView"] = ...`

Inherited from JournalEntryPageHandlebarsSheet.emittedEvents

### format

`number = JOURNAL_ENTRY_PAGE_FORMATS.HTML`

The format used to edit text content in this sheet.

### isV2 (static)

`boolean = true`

Indicates that the sheet renders with App V2 rather than V1.

Inherited from JournalEntryPageHandlebarsSheet.isV2

### RENDER_STATES

`Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

Inherited from JournalEntryPageHandlebarsSheet.RENDER_STATES

### TABS

`Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.

Inherited from JournalEntryPageHandlebarsSheet.TABS

### VIEW_PARTS

`Record<string, HandlebarsTemplatePart> = {}`

Handlebars part to render in view mode.

Inherited from JournalEntryPageHandlebarsSheet.VIEW_PARTS

### _converter (protected static)

`Converter = ...`

Bi-directional HTML <-> Markdown converter.

## Accessors

### isView

```typescript
get isView(): boolean
```

Whether the sheet is in view mode.

**Returns**  
`boolean`

Inherited from JournalEntryPageHandlebarsSheet.isView

### page

```typescript
get page(): documents.JournalEntryPage
```

The JournalEntryPage for this sheet.

**Returns**  
`documents.JournalEntryPage`

Inherited from JournalEntryPageHandlebarsSheet.page

## Methods

### _configureRenderParts

```typescript
_configureRenderParts(options: any): any
```

**Parameters**

- **options**: `any`

**Returns**  
`any`

Inherited from JournalEntryPageHandlebarsSheet._configureRenderParts

### _insertElement

```typescript
_insertElement(element: any): void
```

**Parameters**

- **element**: `any`

**Returns**  
`void`

Inherited from JournalEntryPageHandlebarsSheet._insertElement

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<void>`

Inherited from JournalEntryPageHandlebarsSheet._onRender

### _prepareContext

```typescript
_prepareContext(options: any): Promise<any>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<any>`

Overrides JournalEntryPageHandlebarsSheet._prepareContext

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

Inherited from JournalEntryPageHandlebarsSheet._preparePartContext

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

Overrides JournalEntryPageHandlebarsSheet._prepareSubmitData

### _isEditorDirty (protected, abstract)

```typescript
_isEditorDirty(): boolean
```

Determine if any editors have unsaved changes.

**Returns**  
`boolean`

### _onCloseView (protected)

```typescript
_onCloseView(): void
```

Actions performed when this sheet is closed in some parent view.

**Returns**  
`void`

Inherited from JournalEntryPageHandlebarsSheet._onCloseView

### _prepareContentContext (protected)

```typescript
_prepareContentContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for the content part.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  

**Returns**  
`Promise<void>`

Inherited from JournalEntryPageHandlebarsSheet._prepareContentContext

### _prepareFooterContext (protected)

```typescript
_prepareFooterContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for the footer part.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  

**Returns**  
`Promise<void>`

Inherited from JournalEntryPageHandlebarsSheet._prepareFooterContext

### _prepareHeaderContext (protected)

```typescript
_prepareHeaderContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for the header part.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)  

**Returns**  
`Promise<void>`

Inherited from JournalEntryPageHandlebarsSheet._prepareHeaderContext

### _prepareHeadingLevels (protected)

```typescript
_prepareHeadingLevels(): Record<string, string>
```

Prepare heading level choices.

**Returns**  
`Record<string, string>`

Inherited from JournalEntryPageHandlebarsSheet._prepareHeadingLevels

### inheritanceChain (static)

```typescript
inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

**See**  
[ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

Inherited from JournalEntryPageHandlebarsSheet.inheritanceChain

### parseCSSDimension (static)

```typescript
parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- **style**: `string`  
  The CSS style rule  
- **parentDimension**: `number`  
  The relevant dimension of the parent element

**Returns**  
`number | void`

Inherited from JournalEntryPageHandlebarsSheet.parseCSSDimension

### waitForImages (static)

```typescript
waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement`  
  The element.

**Returns**  
`Promise<void>`

Inherited from JournalEntryPageHandlebarsSheet.waitForImages

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)