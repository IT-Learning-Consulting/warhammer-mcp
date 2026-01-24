# JournalEntryPageProseMirrorSheet | Foundry Virtual Tabletop - API Documentation - Version 13

An Application responsible for displaying a single text-type JournalEntryPage Document, and editing it with a ProseMirror editor.

## Hierarchy
- [JournalEntryPageTextSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html) _(base class)_
- **JournalEntryPageProseMirrorSheet**

## Constructors

```typescript
new JournalEntryPageProseMirrorSheet(
    options: any,
    ...args: any[],
): JournalEntryPageProseMirrorSheet
```

**Parameters**

- `options: any`  
- `...args: any[]`

**Returns**  
JournalEntryPageProseMirrorSheet

**Inherit Doc**  
Inherited from JournalEntryPageTextSheet.constructor

## Properties

### isV2

```typescript
isV2: boolean = ...
```

Indicates that the sheet renders with App V2 rather than V1.

Inherited from JournalEntryPageTextSheet.isV2

### toc

```typescript
toc: Record<string, JournalEntryPageHeading>
```

The table of contents for this text page.

Inherited from JournalEntryPageTextSheet.toc

### BASE_APPLICATION (static)

```typescript
BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2
```

Designates which upstream Application class in this class' inheritance chain is the base application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the `BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the `BASE_APPLICATION` are not dispatched.

Inherited from JournalEntryPageTextSheet.BASE_APPLICATION

### DEFAULT_OPTIONS (static)

```typescript
DEFAULT_OPTIONS: { window: { icon: string } } = ...
```

Overrides JournalEntryPageTextSheet.DEFAULT_OPTIONS

### EDIT_PARTS (static)

```typescript
EDIT_PARTS: {
    content: { template: string };
    footer: HandlebarsTemplatePart;
    header: HandlebarsTemplatePart;
} = ...
```

Overrides JournalEntryPageTextSheet.EDIT_PARTS

### emittedEvents (static)

```typescript
readonly emittedEvents: [unknown, "closeView"] = ...
```

Inherited from JournalEntryPageTextSheet.emittedEvents

### format (static)

```typescript
format: number = JOURNAL_ENTRY_PAGE_FORMATS.HTML
```

The format used to edit text content in this sheet.

Inherited from JournalEntryPageTextSheet.format

### isV2 (static)

```typescript
isV2: boolean = true
```

Indicates that the sheet renders with App V2 rather than V1.

Inherited from JournalEntryPageTextSheet.isV2

### RENDER_STATES (static)

```typescript
RENDER_STATES: Record<string, number> = ...
```

The sequence of rendering states that describe the Application life-cycle.

Inherited from JournalEntryPageTextSheet.RENDER_STATES

### TABS (static)

```typescript
TABS: Record<string, ApplicationTabsConfiguration> = {}
```

Configuration of application tabs, with an entry per tab group.

Inherited from JournalEntryPageTextSheet.TABS

### VIEW_PARTS (static)

```typescript
VIEW_PARTS: { content: { root: boolean; template: string } } = ...
```

Overrides JournalEntryPageTextSheet.VIEW_PARTS

### _converter (protected static)

```typescript
_converter: Converter = ...
```

Bi-directional HTML <-> Markdown converter.

Inherited from JournalEntryPageTextSheet._converter

## Accessors

### isView

```typescript
get isView(): boolean
```

Whether the sheet is in view mode.

**Returns**  
`boolean`

Inherited from JournalEntryPageTextSheet.isView

### page

```typescript
get page(): documents.JournalEntryPage
```

The JournalEntryPage for this sheet.

**Returns**  
`documents.JournalEntryPage`

Inherited from JournalEntryPageTextSheet.page

## Methods

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

**Returns**  
`void`

Inherit Doc

### _canRender

```typescript
_canRender(options: any): boolean
```

**Parameters**

- `options: any`

**Returns**  
`boolean`

### _configureRenderParts

```typescript
_configureRenderParts(options: any): any
```

**Parameters**

- `options: any`

**Returns**  
`any`

Inherited from JournalEntryPageTextSheet._configureRenderParts

### _insertElement

```typescript
_insertElement(element: any): void
```

**Parameters**

- `element: any`

**Returns**  
`void`

Inherited from JournalEntryPageTextSheet._insertElement

### _isEditorDirty

```typescript
_isEditorDirty(): any
```

**Returns**  
`any`

Overrides JournalEntryPageTextSheet._isEditorDirty

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters**

- `context: any`  
- `options: any`

**Returns**  
`Promise<void>`

Inherited from JournalEntryPageTextSheet._onRender

### _prepareContentContext

```typescript
_prepareContentContext(context: any, options: any): Promise<void>
```

**Parameters**

- `context: any`  
- `options: any`

**Returns**  
`Promise<void>`

Overrides JournalEntryPageTextSheet._prepareContentContext

### _prepareContext

```typescript
_prepareContext(options: any): Promise<any>
```

**Parameters**

- `options: any`

**Returns**  
`Promise<any>`

Inherited from JournalEntryPageTextSheet._prepareContext

### _preparePartContext

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```

**Parameters**

- `partId: any`  
- `context: any`  
- `options: any`

**Returns**  
`Promise<any>`

Inherited from JournalEntryPageTextSheet._preparePartContext

### _prepareSubmitData

```typescript
_prepareSubmitData(event: any, form: any, formData: any, updateData: any): any
```

**Parameters**

- `event: any`  
- `form: any`  
- `formData: any`  
- `updateData: any`

**Returns**  
`any`

Inherited from JournalEntryPageTextSheet._prepareSubmitData

### _onCloseView (protected)

```typescript
_onCloseView(): void
```

Actions performed when this sheet is closed in some parent view.

**Returns**  
`void`

Inherited from JournalEntryPageTextSheet._onCloseView

### _onConfigurePlugins (protected)

```typescript
_onConfigurePlugins(event: ProseMirrorPluginsEvent): void
```

Configure plugins for the ProseMirror instance.

**Parameters**

- `event: ProseMirrorPluginsEvent`

**Returns**  
`void`

### _prepareFooterContext (protected)

```typescript
_prepareFooterContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for the footer part.

**Parameters**

- `context: ApplicationRenderContext`  
- `options: HandlebarsRenderOptions`

**Returns**  
`Promise<void>`

Inherited from JournalEntryPageTextSheet._prepareFooterContext

### _prepareHeaderContext (protected)

```typescript
_prepareHeaderContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Prepare render context for the header part.

**Parameters**

- `context: ApplicationRenderContext`  
- `options: HandlebarsRenderOptions`

**Returns**  
`Promise<void>`

Inherited from JournalEntryPageTextSheet._prepareHeaderContext

### _prepareHeadingLevels (protected)

```typescript
_prepareHeadingLevels(): Record<string, string>
```

Prepare heading level choices.

**Returns**  
`Record<string, string>`

Inherited from JournalEntryPageTextSheet._prepareHeadingLevels

### inheritanceChain (static)

```typescript
inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

**See**: [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

Inherited from JournalEntryPageTextSheet.inheritanceChain

### parseCSSDimension (static)

```typescript
parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- `style: string` — The CSS style rule  
- `parentDimension: number` — The relevant dimension of the parent element

**Returns**  
`number | void`

Inherited from JournalEntryPageTextSheet.parseCSSDimension

### waitForImages (static)

```typescript
waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- `element: HTMLElement` — The element.

**Returns**  
`Promise<void>`

Inherited from JournalEntryPageTextSheet.waitForImages

---

For more details, refer to the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageProseMirrorSheet.html)