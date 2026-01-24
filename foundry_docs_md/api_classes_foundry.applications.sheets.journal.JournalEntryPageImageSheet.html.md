# JournalEntryPageImageSheet

An Application responsible for displaying and editing a single image-type JournalEntryPage Document.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sheets.journal.JournalEntryPageImageSheet)  
- *JournalEntryPageHandlebarsSheet*  
- **JournalEntryPageImageSheet**

---

## Constructors

### constructor

```typescript
new JournalEntryPageImageSheet(
    options: any,
    ...args: any[],
): JournalEntryPageImageSheet
```

**Parameters**

- **options**: `any`  
- **...args**: `any[]`

**Returns**  
`JournalEntryPageImageSheet`

**Inherit Doc**  
Inherited from `JournalEntryPageHandlebarsSheet.constructor`

---

## Properties

### isV2

`isV2: boolean = ...`

Indicates that the sheet renders with App V2 rather than V1.  
Inherited from `JournalEntryPageHandlebarsSheet.isV2`

### toc

`toc: Record<string, JournalEntryPageHeading>`

The table of contents for this text page.  
Inherited from `JournalEntryPageHandlebarsSheet.toc`

---

## Static Properties

### BASE_APPLICATION

`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base application. Any DEFAULT_OPTIONS of super-classes further upstream of the BASE_APPLICATION are ignored. Hook events for super-classes further upstream of the BASE_APPLICATION are not dispatched.  
Inherited from `JournalEntryPageHandlebarsSheet.BASE_APPLICATION`

### DEFAULT_OPTIONS

`DEFAULT_OPTIONS: { classes: string[]; window: { icon: string } } = ...`

Overrides `JournalEntryPageHandlebarsSheet.DEFAULT_OPTIONS`

### EDIT_PARTS

```typescript
EDIT_PARTS: {
    content: { classes: string[]; template: string };
    footer: HandlebarsTemplatePart;
    header: HandlebarsTemplatePart;
} = ...
```

Overrides `JournalEntryPageHandlebarsSheet.EDIT_PARTS`

### emittedEvents

`emittedEvents: readonly [unknown, "closeView"] = ...`

Inherited from `JournalEntryPageHandlebarsSheet.emittedEvents`

### isV2

`isV2: boolean = true`

Indicates that the sheet renders with App V2 rather than V1.  
Inherited from `JournalEntryPageHandlebarsSheet.isV2`

### RENDER_STATES

`RENDER_STATES: Record<string, number> = ...`

The sequence of rendering states that describe the Application life-cycle.  
Inherited from `JournalEntryPageHandlebarsSheet.RENDER_STATES`

### TABS

`TABS: Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.  
Inherited from `JournalEntryPageHandlebarsSheet.TABS`

### VIEW_PARTS

```typescript
VIEW_PARTS: { content: { root: boolean; template: string } } = ...
```

Overrides `JournalEntryPageHandlebarsSheet.VIEW_PARTS`

---

## Accessors

### isView

```typescript
get isView(): boolean
```

Whether the sheet is in view mode.

**Returns**  
`boolean`  

Inherited from `JournalEntryPageHandlebarsSheet.isView`

### page

```typescript
get page(): documents.JournalEntryPage
```

The JournalEntryPage for this sheet.

**Returns**  
`documents.JournalEntryPage`

Inherited from `JournalEntryPageHandlebarsSheet.page`

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

Inherited from `JournalEntryPageHandlebarsSheet._configureRenderParts`

### _insertElement

```typescript
_insertElement(element: any): void
```

**Parameters**

- **element**: `any`

**Returns**  
`void`  

Inherited from `JournalEntryPageHandlebarsSheet._insertElement`

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

**Parameters**

- **context**: `any`  
- **options**: `any`

**Returns**  
`Promise<void>`

Inherited from `JournalEntryPageHandlebarsSheet._onRender`

### _prepareContext

```typescript
_prepareContext(options: any): Promise<any>
```

**Parameters**

- **options**: `any`

**Returns**  
`Promise<any>`

Overrides `JournalEntryPageHandlebarsSheet._prepareContext`

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

Inherited from `JournalEntryPageHandlebarsSheet._preparePartContext`

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

Inherited from `JournalEntryPageHandlebarsSheet._prepareSubmitData`

### _onCloseView

```typescript
protected _onCloseView(): void
```

Protected  
Actions performed when this sheet is closed in some parent view.

**Returns**  
`void`

Inherited from `JournalEntryPageHandlebarsSheet._onCloseView`

### _prepareContentContext

```typescript
protected _prepareContentContext(
    context: ApplicationRenderContext,
    options: HandlebarsRenderOptions,
): Promise<void>
```

Protected  
Prepare render context for the content part.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
- **options**: [HandlebarsRenderOptions](https://foundryvtt.com/api/interfaces/foundry.HandlebarsRenderOptions.html)

**Returns**  
`Promise<void>`

Inherited from `JournalEntryPageHandlebarsSheet._prepareContentContext`

### _prepareFooterContext

```typescript
protected _prepareFooterContext(
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

Inherited from `JournalEntryPageHandlebarsSheet._prepareFooterContext`

### _prepareHeaderContext

```typescript
protected _prepareHeaderContext(
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

Inherited from `JournalEntryPageHandlebarsSheet._prepareHeaderContext`

### _prepareHeadingLevels

```typescript
protected _prepareHeadingLevels(): Record<string, string>
```

Protected  
Prepare heading level choices.

**Returns**  
`Record<string, string>`

Inherited from `JournalEntryPageHandlebarsSheet._prepareHeadingLevels`

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

**Returns**  
`Generator<typeof ApplicationV2, void, unknown>`

**See also**  
[ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

Inherited from `JournalEntryPageHandlebarsSheet.inheritanceChain`

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

Inherited from `JournalEntryPageHandlebarsSheet.parseCSSDimension`

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

Inherited from `JournalEntryPageHandlebarsSheet.waitForImages`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)