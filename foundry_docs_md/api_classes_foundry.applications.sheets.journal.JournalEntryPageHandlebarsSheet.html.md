# JournalEntryPageHandlebarsSheet | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract subclass that contains specialised handlebars logic for JournalEntryPageSheets.

**Mixes**  
HandlebarsApplication

**Hierarchy** ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sheets.journal.JournalEntryPageHandlebarsSheet))  
- [JournalEntryPageSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageSheet.html)<this>  
- **JournalEntryPageHandlebarsSheet**  
- [JournalEntryPageTextSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageTextSheet.html)  
- [JournalEntryPageImageSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageImageSheet.html)  
- [JournalEntryPagePDFSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPagePDFSheet.html)  
- [JournalEntryPageVideoSheet](https://foundryvtt.com/api/classes/foundry.applications.sheets.journal.JournalEntryPageVideoSheet.html)  

---

## Constructors

```typescript
new JournalEntryPageHandlebarsSheet(
    options: any,
    ...args: any[],
): JournalEntryPageHandlebarsSheet
```

**Parameters**

- **options**: `any`  
- **...args**: `any[]`

**Returns**  
`JournalEntryPageHandlebarsSheet`

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(JournalEntryPageSheet).constructor

---

## Properties

### isV2

`isV2: boolean = ...`

Indicates that the sheet renders with App V2 rather than V1.

Inherited from HandlebarsApplicationMixin(JournalEntryPageSheet).isV2

### toc

`toc: Record<string, JournalEntryPageHeading>`

The table of contents for this text page.

Inherited from HandlebarsApplicationMixin(JournalEntryPageSheet).toc

### BASE_APPLICATION (static)

`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base application.  
Any `DEFAULT_OPTIONS` of super-classes further upstream of the BASE_APPLICATION are ignored.  
Hook events for super-classes further upstream of the BASE_APPLICATION are not dispatched.

Reference: [ApplicationV2](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html)

### DEFAULT_OPTIONS (static)

```typescript
DEFAULT_OPTIONS: {
    classes: string[];
    form: { submitOnChange: boolean };
    includeTOC: boolean;
    mode: string;
    position: { height: number; width: number };
    viewClasses: never[];
    viewPermission: 2;
    window: { resizable: boolean };
} = ...
```

### EDIT_PARTS (static)

`EDIT_PARTS: Record<string, HandlebarsTemplatePart> = ...`

Handlebars parts to render in edit mode.

Reference: [HandlebarsTemplatePart](https://foundryvtt.com/api/interfaces/foundry.HandlebarsTemplatePart.html)

### emittedEvents (static)

`emittedEvents: readonly [unknown, "closeView"] = ...`

### isV2 (static)

`isV2: boolean = true`

Indicates that the sheet renders with App V2 rather than V1.

### RENDER_STATES (static)

`RENDER_STATES: Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.

### TABS (static)

`TABS: Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.

Reference: [ApplicationTabsConfiguration](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationTabsConfiguration.html)

### VIEW_PARTS (static)

`VIEW_PARTS: Record<string, HandlebarsTemplatePart> = {}`

Handlebars parts to render in view mode.

Reference: [HandlebarsTemplatePart](https://foundryvtt.com/api/interfaces/foundry.HandlebarsTemplatePart.html)

---

## Accessors

### isView

```typescript
get isView(): boolean
```

Whether the sheet is in view mode.

**Returns**  
`boolean`

Inherited from HandlebarsApplicationMixin(JournalEntryPageSheet).isView

### page

```typescript
get page(): documents.JournalEntryPage
```

The JournalEntryPage for this sheet.

**Returns**  
`documents.JournalEntryPage`

Inherited from HandlebarsApplicationMixin(JournalEntryPageSheet).page

---

## Methods

### _configureRenderParts

```typescript
_configureRenderParts(options: any): any
```

**Parameters**

- **options**: `any`

**Returns**  
`any`

### _insertElement

```typescript
_insertElement(element: any): void
```

**Parameters**

- **element**: `any`

**Returns**  
`void`

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(JournalEntryPageSheet)._insertElement

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`
- **options**: `any`

**Returns**  
`Promise<void>`

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(JournalEntryPageSheet)._onRender

### _prepareContext

```typescript
_prepareContext(options: any): Promise<any>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<any>`

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(JournalEntryPageSheet)._prepareContext

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

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(JournalEntryPageSheet)._preparePartContext

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

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(JournalEntryPageSheet)._prepareSubmitData

### _onCloseView

```typescript
protected _onCloseView(): void
```

Actions performed when this sheet is closed in some parent view.

**Returns**  
`void`

**Inherit Doc**  
Inherited from HandlebarsApplicationMixin(JournalEntryPageSheet)._onCloseView

### _prepareContentContext

```typescript
protected _prepareContentContext(
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

### _prepareFooterContext

```typescript
protected _prepareFooterContext(
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

### _prepareHeaderContext

```typescript
protected _prepareHeaderContext(
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

### _prepareHeadingLevels

```typescript
protected _prepareHeadingLevels(): Record<string, string>
```

Prepare heading level choices.

**Returns**  
`Record<string, string>`

Inherited from HandlebarsApplicationMixin(JournalEntryPageSheet)._prepareHeadingLevels

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application.  
The chain includes this Application itself and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

**See**  
[ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

### parseCSSDimension

```typescript
static parseCSSDimension(style: string, parentDimension: number): number | void
```

Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters**

- **style**: `string`  
  The CSS style rule  
- **parentDimension**: `number`  
  The relevant dimension of the parent element

**Returns**  
`number | void`  
The parsed style dimension in pixels

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement`  
  The element.

**Returns**  
`Promise<void>`