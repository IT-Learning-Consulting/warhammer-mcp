# Class ItemDirectory

The World Item directory listing.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [applications](https://foundryvtt.com/api/modules/foundry.applications.html) / [sidebar](https://foundryvtt.com/api/modules/foundry.applications.sidebar.html) / [tabs](https://foundryvtt.com/api/modules/foundry.applications.sidebar.tabs.html) / [ItemDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ItemDirectory.html)

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sidebar.tabs.ItemDirectory)  
- *DocumentDirectory*  
- **ItemDirectory**

---

## Properties

### options
- Type: `Readonly<DocumentDirectoryConfiguration>`
- Description: Application instance configuration options.  
- Inherited from `DocumentDirectory.options`

### position
- Type: `ApplicationPosition = ...`
- Description: The current position of the application with respect to the `window.document.body`.  
- Inherited from `DocumentDirectory.position`

### tabGroups
- Type: `Record<string, null | string> = ...`
- Description: If this Application uses tabbed navigation groups, this mapping is updated whenever the  
  `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active.  
  Subclasses may override this property to define default tabs for each group.  
- Inherited from `DocumentDirectory.tabGroups`

---

## Static Properties

### BASE_APPLICATION
- Type: `typeof ApplicationV2 = ApplicationV2`
- Description:  
  Designates which upstream Application class in this class' inheritance chain is the base application.  
  Any `DEFAULT_OPTIONS` of super-classes further upstream of the `BASE_APPLICATION` are ignored.  
  Hook events for super-classes further upstream of the `BASE_APPLICATION` are not dispatched.  
- Inherited from `DocumentDirectory.BASE_APPLICATION`

### DEFAULT_OPTIONS
- Type: `{ collection: string } = ...`
- Description: Overrides `DocumentDirectory.DEFAULT_OPTIONS`

### emittedEvents
- Type: `readonly ["render", "close", "position", "activate", "deactivate"] = ...`
- Description: Inherited from `DocumentDirectory.emittedEvents`

### PARTS
- Type:

  ```typescript
  {
    directory: { scrollable: string[]; template: string };
    footer: { template: string };
    header: { template: string };
  } = ...
  ```
- Description: Inherited from `DocumentDirectory.PARTS`

### RENDER_STATES
- Type: `Record<string, number> = ...`
- Description: The sequence of rendering states that describe the Application life-cycle.  
- Inherited from `DocumentDirectory.RENDER_STATES`

### tabName
- Type: `string = "items"`
- Description: Overrides `DocumentDirectory.tabName`

### TABS
- Type: `Record<string, ApplicationTabsConfiguration> = {}`  
- Description: Configuration of application tabs, with an entry per tab group.  
- Inherited from `DocumentDirectory.TABS`

### _entryPartial
- Type: `string = "templates/sidebar/partials/document-partial.hbs"`
- Description: The path to the template used to render a single entry within the directory.  
- Inherited from `DocumentDirectory._entryPartial`

### _folderPartial
- Type: `string = "templates/sidebar/partials/folder-partial.hbs"`
- Description: The path to the template used to render a single folder within the directory.  
- Inherited from `DocumentDirectory._folderPartial`

---

## Accessors

### get active(): boolean
Whether this tab is currently active in the sidebar.  
Returns `boolean`  
Inherited from `DocumentDirectory.active`

### get classList(): DOMTokenList
The CSS class list of this Application instance  
Returns `DOMTokenList`  
Inherited from `DocumentDirectory.classList`

### get collection(): DirectoryCollection
The Document collection that this directory represents.  
Returns `DirectoryCollection`  
Inherited from `DocumentDirectory.collection`

### get documentClass(): Constructor<TDocument>
The implementation of the Document type that this directory represents.  
Returns `Constructor<TDocument>`  
Inherited from `DocumentDirectory.documentClass`

### get documentName(): string
The named Document type that this directory represents.  
Returns `string`  
Inherited from `DocumentDirectory.documentName`

### get element(): HTMLElement
The HTMLElement which renders this Application into the DOM.  
Returns `HTMLElement`  
Inherited from `DocumentDirectory.element`

### get form(): null | HTMLFormElement
Does this Application have a top-level form element?  
Returns `null | HTMLFormElement`  
Inherited from `DocumentDirectory.form`

### get hasFrame(): boolean
Does this Application instance render within an outer window frame?  
Returns `boolean`  
Inherited from `DocumentDirectory.hasFrame`

### get id(): string
The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.  
Returns `string`  
Inherited from `DocumentDirectory.id`

### get isPopout(): boolean
Whether this is the popped-out tab or the in-sidebar one.  
Returns `boolean`  
Inherited from `DocumentDirectory.isPopout`

### get minimized(): boolean
Is this Application instance currently minimized?  
Returns `boolean`  
Inherited from `DocumentDirectory.minimized`

### get popout(): void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>
A reference to the popped-out version of this tab, if one exists.  
Returns `void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>`  
Inherited from `DocumentDirectory.popout`

### get rendered(): boolean
Is this Application instance currently rendered?  
Returns `boolean`  
Inherited from `DocumentDirectory.rendered`

### get state(): number
The current render state of the Application.  
Returns `number`  
Inherited from `DocumentDirectory.state`

### get tabName(): string
The base name of the sidebar tab.  
Returns `string`  
Inherited from `DocumentDirectory.tabName`

### get title(): string
Returns `string`  
Inherited from `DocumentDirectory.title`

### get window(): {
  close: HTMLButtonElement;
  content: HTMLElement;
  controls: HTMLButtonElement;
  controlsDropdown: HTMLDivElement;
  header: HTMLElement;
  icon: HTMLElement;
  onDrag: Function;
  onResize: Function;
  pointerMoveThrottle: boolean;
  pointerStartPosition: ApplicationPosition;
  resize: HTMLElement;
  title: HTMLHeadingElement;
}
Convenience references to window header elements.  
Returns an object with references to various window elements.  
Inherited from `DocumentDirectory.window`

---

## Methods

```typescript
_canDragStart(selector: any): boolean
```
- Parameters:
  - **selector**: `any`  
- Returns: `boolean`  
- Description: Overrides `DocumentDirectory._canDragStart`

```typescript
_canRender(options: any): false | void
```
- Parameters:
  - **options**: `any`  
- Returns: `false | void`  
- Description: Inherited from `DocumentDirectory._canRender`

```typescript
_configureRenderParts(options: any): any
```
- Parameters:
  - **options**: `any`  
- Returns: `any`  
- Description: Inherited from `DocumentDirectory._configureRenderParts`

```typescript
_getEntryContextOptions(): {
  callback: (li: any) => void;
  condition: (li: any) => boolean;
  icon: string;
  name: string;
}[]
```
- Returns: An array of objects containing:  
  - **callback**: `(li: any) => void`  
  - **condition**: `(li: any) => boolean`  
  - **icon**: `string`  
  - **name**: `string`  
- Description: Overrides `DocumentDirectory._getEntryContextOptions`

```typescript
_initializeApplicationOptions(options: any): any
```
- Parameters:
  - **options**: `any`  
- Returns: `any`  
- Description: Inherited from `DocumentDirectory._initializeApplicationOptions`

```typescript
_onClose(options: any): void
```
- Parameters:
  - **options**: `any`  
- Returns: `void`  
- Description: Inherited from `DocumentDirectory._onClose`

```typescript
_onDragStart(event: any): void
```
- Parameters:
  - **event**: `any`  
- Returns: `void`  
- Description: Inherited from `DocumentDirectory._onDragStart`

```typescript
_onDrop(event: any): undefined | Promise<void>
```
- Parameters:
  - **event**: `any`  
- Returns: `undefined | Promise<void>`  
- Description: Inherited from `DocumentDirectory._onDrop`

```typescript
_onFirstRender(context: any, options: any): Promise<void>
```
- Parameters:
  - **context**: `any`  
  - **options**: `any`  
- Returns: `Promise<void>`  
- Description: Inherited from `DocumentDirectory._onFirstRender`

```typescript
_onRender(context: any, options: any): Promise<void>
```
- Parameters:
  - **context**: `any`  
  - **options**: `any`  
- Returns: `Promise<void>`  
- Description: Inherited from `DocumentDirectory._onRender`

```typescript
_prepareContext(
  options: any,
): Promise<ApplicationRenderContext & {
  canCreateEntry: boolean;
  canCreateFolder: boolean;
  documentName: string;
  folderIcon: string;
  sidebarIcon: any;
}>
```
- Parameters:
  - **options**: `any`  
- Returns: `Promise` resolving to context with extra flags and icons  
- Description: Inherited from `DocumentDirectory._prepareContext`

```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```
- Parameters:
  - **partId**: `any`  
  - **context**: `any`  
  - **options**: `any`  
- Returns: `Promise<any>`  
- Description: Inherited from `DocumentDirectory._preparePartContext`

```typescript
_preSyncPartState(
  partId: any,
  newElement: any,
  priorElement: any,
  state: any,
): void
```
- Parameters:
  - **partId**: `any`  
  - **newElement**: `any`  
  - **priorElement**: `any`  
  - **state**: `any`  
- Returns: `void`  
- Description: Inherited from `DocumentDirectory._preSyncPartState`

```typescript
_renderFrame(options: any): Promise<HTMLElement>
```
- Parameters:
  - **options**: `any`  
- Returns: `Promise<HTMLElement>`  
- Description: Inherited from `DocumentDirectory._renderFrame`

```typescript
_renderHTML(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<any>
```
- Parameters:
  - **context**: `ApplicationRenderContext`  
  - **options**: `HandlebarsRenderOptions`  
- Returns: `Promise<any>`  
- Description: Render an HTMLElement for the Application.  
  An Application subclass must implement this method to be renderable.  
- Inherited from `DocumentDirectory._renderHTML`

```typescript
_syncPartState(
  partId: any,
  newElement: any,
  priorElement: any,
  state: any,
): void
```
- Parameters:
  - **partId**: `any`  
  - **newElement**: `any`  
  - **priorElement**: `any`  
  - **state**: `any`  
- Returns: `void`  
- Description: Inherited from `DocumentDirectory._syncPartState`

```typescript
activate(): void
```
- Description: Activate this tab in the sidebar.  
- Returns: `void`  
- Inherited from `DocumentDirectory.activate`

```typescript
addEventListener(
  type: string,
  listener: EmittedEventListener,
  options?: { once?: boolean },
): void
```
- Parameters:
  - **type**: `string` - The type of event being registered for  
  - **listener**: `EmittedEventListener` - The listener function called when the event occurs  
  - **options** (optional):  
    - **once?**: `boolean` - Should the event only be responded to once and then removed  
- Returns: `void`  
- See: [MDN - addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
- Inherited from `DocumentDirectory.addEventListener`

```typescript
bringToFront(): void
```
- Description:  
  Bring this Application window to the front of the rendering stack by increasing its z-index.  
- Returns: `void`  
- Inherited from `DocumentDirectory.bringToFront`

```typescript
changeTab(
  tab: string,
  group: string,
  options?: {
    event?: Event;
    force?: boolean;
    navElement?: HTMLElement;
    updatePosition?: boolean;
  },
): void
```
- Description: Change the active tab within a tab group in this Application instance.  
- Parameters:
  - **tab**: `string` - The name of the tab which should become active  
  - **group**: `string` - The name of the tab group which defines the set of tabs  
  - **options** (optional):  
    - **event?**: `Event` - An interaction event which caused the tab change, if any  
    - **force?**: `boolean` - Force changing the tab even if the new tab is already active  
    - **navElement?**: `HTMLElement` - An explicit navigation element being modified  
    - **updatePosition?**: `boolean` - Update application position after changing the tab?  
- Returns: `void`  
- Inherited from `DocumentDirectory.changeTab`

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<ItemDirectory>
```
- Description: Close the Application, removing it from the DOM.  
- Parameters:
  - **options** (optional): `Partial<ApplicationClosingOptions> = {}` - Options which modify how the application is closed.  
- Returns: `Promise<ItemDirectory>` - A Promise which resolves to the closed Application instance  
- Inherited from `DocumentDirectory.close`

```typescript
collapseAll(): void
```
- Description: Collapse all open folders in this directory.  
- Returns: `void`  
- Inherited from `DocumentDirectory.collapseAll`

```typescript
dispatchEvent(event: Event): boolean
```
- Description: Dispatch an event on this target.  
- Parameters:
  - **event**: `Event` - The Event to dispatch  
- Returns: `boolean` - Was default behavior for the event prevented?  
- See: [MDN - dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
- Inherited from `DocumentDirectory.dispatchEvent`

```typescript
maximize(): Promise<void>
```
- Description: Restore the Application to its original dimensions.  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory.maximize`

```typescript
minimize(): Promise<void>
```
- Description: Minimize the Application, collapsing it to a minimal header.  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory.minimize`

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```
- Description: Remove an event listener for a certain type of event.  
- Parameters:
  - **type**: `string` - The type of event being removed  
  - **listener**: `EmittedEventListener` - The listener function being removed  
- Returns: `void`  
- See: [MDN - removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
- Inherited from `DocumentDirectory.removeEventListener`

```typescript
render(options: any, _options: any): Promise<ItemDirectory>
```
- Parameters:
  - **options**: `any`  
  - **_options**: `any`  
- Returns: `Promise<ItemDirectory>`  
- Inherited from `DocumentDirectory.render`

```typescript
renderPopout(): Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>
```
- Description: Pop-out this sidebar tab as a new application.  
- Returns: `Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>`  
- Inherited from `DocumentDirectory.renderPopout`

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```
- Description: Update the Application element position using provided data which is merged with the prior position.  
- Parameters:
  - **position** (optional): `Partial<ApplicationPosition>` - New Application positioning data  
- Returns: `void | ApplicationPosition` - The updated application position  
- Inherited from `DocumentDirectory.setPosition`

```typescript
submit(submitOptions?: object): Promise<any>
```
- Description: Programmatically submit an ApplicationV2 instance which implements a single top-level form.  
- Parameters:
  - **submitOptions** (optional): `object = {}` - Arbitrary options which are supported by and provided to the configured form submission handler.  
- Returns: `Promise<any>` - A promise that resolves to the returned result of the form submission handler, if any.  
- Inherited from `DocumentDirectory.submit`

```typescript
toggleControls(expanded?: boolean, options?: { animate?: boolean }): Promise<void>
```
- Description: Toggle display of the Application controls menu. Only applicable to window Applications.  
- Parameters:
  - **expanded** (optional): `boolean` - Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value  
  - **options** (optional): `{ animate?: boolean } = {}` - Options to configure the toggling behavior.  
    - **animate?**: `boolean` - Animate the controls toggling  
- Returns: `Promise<void>` - A Promise which resolves once the control expansion animation is complete  
- Inherited from `DocumentDirectory.toggleControls`

```typescript
_attachFrameListeners(): void
```
- Description: Attach event listeners to the Application frame.  
- Returns: `void`  
- Inherited from `DocumentDirectory._attachFrameListeners`

```typescript
_canCreateEntry(): boolean
```
- Description: Determine if the current user has permission to create directory entries.  
- Returns: `boolean`  
- Inherited from `DocumentDirectory._canCreateEntry`

```typescript
_canCreateFolder(): boolean
```
- Description: Determine if the current user has permission to create folders in this directory.  
- Returns: `boolean`  
- Inherited from `DocumentDirectory._canCreateFolder`

```typescript
_canDragDrop(selector: string): boolean
```
- Description: Determine if drop operations are permitted.  
- Parameters:
  - **selector**: `string` - The candidate HTML selector for dragging  
- Returns: `boolean` - Can the current user drag this selector?  
- Inherited from `DocumentDirectory._canDragDrop`

```typescript
_configureRenderOptions(options: HandlebarsRenderOptions): void
```
- Description: Modify the provided options passed to a render request.  
- Parameters:
  - **options**: `HandlebarsRenderOptions` - Options which configure application rendering behavior  
- Returns: `void`  
- Inherited from `DocumentDirectory._configureRenderOptions`

```typescript
_createContextMenu(
  handler: () => ContextMenuEntry[],
  selector: string,
  options?: {
    container?: HTMLElement;
    hookName?: string;
    parentClassHooks?: boolean;
  }
): null | ContextMenu
```
- Description: Create a ContextMenu instance used in this Application.  
- Parameters:
  - **handler**: `() => ContextMenuEntry[]` - A handler function that provides initial context options  
  - **selector**: `string` - A CSS selector to which the ContextMenu will be bound  
  - **options** (optional):  
    - **container?**: `HTMLElement` - A parent HTMLElement which contains the selector target  
    - **hookName?**: `string` - The hook name  
    - **parentClassHooks?**: `boolean` - Whether to call hooks for the parent classes in the inheritance chain.  
- Returns: `null | ContextMenu` - A created ContextMenu or null if no menu items were defined  
- Inherited from `DocumentDirectory._createContextMenu`

```typescript
_createContextMenus(): void
```
- Description: Register context menu entries and fire hooks.  
- Returns: `void`  
- Inherited from `DocumentDirectory._createContextMenus`

```typescript
_createDroppedEntry(entry: DirectoryMixinEntry, updates?: object): Promise<documents.Item>
```
- Description: Create a new entry in this directory from one that was dropped on it.  
- Parameters:
  - **entry**: `DirectoryMixinEntry` - The dropped entry.  
  - **updates** (optional): `object = {}` - Modifications to the creation data.  
- Returns: `Promise<documents.Item>`  
- Inherited from `DocumentDirectory._createDroppedEntry`

```typescript
_createDroppedFolderContent(
  folder: documents.Folder,
  targetFolder?: documents.Folder,
): Promise<documents.Folder[]>
```
- Description: Import a dropped folder and its children into this collection if they do not already exist.  
- Parameters:
  - **folder**: `documents.Folder` - The folder being dropped.  
  - **targetFolder** (optional): `documents.Folder` - A folder to import into if not the directory root.  
- Returns: `Promise<documents.Folder[]>`  
- Inherited from `DocumentDirectory._createDroppedFolderContent`

```typescript
_createDroppedFolderDocuments(
  folder: documents.Folder,
  documents: object[] | documents.Item[],
): Promise<void>
```
- Description: Create a set of documents in a dropped folder.  
- Parameters:
  - **folder**: `documents.Folder` - The dropped folder.  
  - **documents**: `object[] | documents.Item[]` - The documents to create, or their indices.  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory._createDroppedFolderDocuments`

```typescript
_entryAlreadyExists(entry: ClientDocument): boolean
```
- Description: Test if the given entry is already present in this directory.  
- Parameters:
  - **entry**: `ClientDocument` - The directory entry.  
- Returns: `boolean`  
- Inherited from `DocumentDirectory._entryAlreadyExists`

```typescript
_entryBelongsToFolder(entry: DirectoryMixinEntry, folder: string): boolean
```
- Description: Determine whether a given directory entry belongs to the given folder.  
- Parameters:
  - **entry**: `DirectoryMixinEntry` - The entry.  
  - **folder**: `string` - The target folder ID.  
- Returns: `boolean`  
- Inherited from `DocumentDirectory._entryBelongsToFolder`

```typescript
_getDroppedEntryFromData(data: object): Promise<ClientDocument>
```
- Description: Get the entry instance from its dropped data.  
- Parameters:
  - **data**: `object` - The drag data.  
- Returns: `Promise<ClientDocument>`  
- Throws: If the correct instance type could not be retrieved.  
- Inherited from `DocumentDirectory._getDroppedEntryFromData`

```typescript
_getEntryDragData(entryId: string): any
```
- Description: Get drag data for an entry in this directory.  
- Parameters:
  - **entryId**: `string` - The entry's ID.  
- Returns: `any`  
- Inherited from `DocumentDirectory._getEntryDragData`

```typescript
_getFolderContextOptions(): ContextMenuEntry[]
```
- Description: Get context menu entries for folders in this directory.  
- Returns: `ContextMenuEntry[]`  
- Inherited from `DocumentDirectory._getFolderContextOptions`

```typescript
_getFolderDragData(folderId: string): any
```
- Description: Get drag data for a folder in this directory.  
- Parameters:
  - **folderId**: `string` - The folder ID.  
- Returns: `any`  
- Inherited from `DocumentDirectory._getFolderDragData`

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```
- Description: Configure the array of header control menu options.  
- Returns: `ApplicationHeaderControlsEntry[]`  
- Inherited from `DocumentDirectory._getHeaderControls`

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```
- Description: Get the configuration for a tabs group.  
- Parameters:
  - **group**: `string` - The ID of a tabs group  
- Returns: `null | ApplicationTabsConfiguration`  
- Inherited from `DocumentDirectory._getTabsConfig`

```typescript
_handleDroppedEntry(target: HTMLElement, data: object): Promise<void>
```
- Description: Handle dropping a new entry into this directory.  
- Parameters:
  - **target**: `HTMLElement` - The drop target element.  
  - **data**: `object` - The drop data.  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory._handleDroppedEntry`

```typescript
_handleDroppedFolder(target: HTMLElement, data: object): Promise<void>
```
- Description: Handle dropping a folder onto the directory.  
- Parameters:
  - **target**: `HTMLElement` - The drop target element.  
  - **data**: `object` - The drop data.  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory._handleDroppedFolder`

```typescript
_handleDroppedForeignFolder(
  folder: documents.Folder,
  closestFolderId: string,
  sortData: object,
): Promise<null | { folder: documents.Folder; sortNeeded: boolean }>
```
- Description: Handle importing a new folder's contents into the directory.  
- Parameters:
  - **folder**: `documents.Folder` - The dropped folder.  
  - **closestFolderId**: `string` - The ID of the closest folder to the drop target.  
  - **sortData**: `object` - Sort data for the folder.  
- Returns: `Promise<null | { folder: documents.Folder; sortNeeded: boolean }>`  
- Inherited from `DocumentDirectory._handleDroppedForeignFolder`

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```
- Description: Iterate over header control buttons, filtering for controls which are visible for the current client.  
- Returns: `Generator<ApplicationHeaderControlsEntry, any, any>`  
- Inherited from `DocumentDirectory._headerControlButtons`

```typescript
_insertElement(element: HTMLElement): void
```
- Description: Insert the application HTML element into the DOM.  
  Subclasses may override this method to customize how the application is inserted.  
- Parameters:
  - **element**: `HTMLElement` - The element to insert  
- Returns: `void`  
- Inherited from `DocumentDirectory._insertElement`

```typescript
_matchSearchEntries(
  query: RegExp,
  entryIds: Set<string>,
  folderIds: Set<string>,
  autoExpandIds: Set<string>,
  options?: object,
): void
```
- Description: Identify entries in the collection which match a provided search query.  
- Parameters:
  - **query**: `RegExp` - The search query.  
  - **entryIds**: `Set<string>` - The set of matched entry IDs.  
  - **folderIds**: `Set<string>` - The set of matched folder IDs.  
  - **autoExpandIds**: `Set<string>` - The set of folder IDs that should be auto-expanded.  
  - **options** (optional): `object = {}` - Additional options for subclass-specific behavior.  
- Returns: `void`  
- Inherited from `DocumentDirectory._matchSearchEntries`

```typescript
_matchSearchFolders(
  query: RegExp,
  folderIds: Set<string>,
  autoExpandIds: Set<string>,
  options?: object,
): void
```
- Description: Identify folders in the collection which match a provided search query.  
- Parameters:
  - **query**: `RegExp` - The search query.  
  - **folderIds**: `Set<string>` - The set of matched folder IDs.  
  - **autoExpandIds**: `Set<string>` - The set of folder IDs that should be auto-expanded.  
  - **options** (optional): `object = {}` - Additional options for subclass-specific behavior.  
- Returns: `void`  
- Inherited from `DocumentDirectory._matchSearchFolders`

```typescript
_onActivate(): void
```
- Description: Actions performed when this tab is activated in the sidebar.  
- Returns: `void`  
- Inherited from `DocumentDirectory._onActivate`

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```
- Description: Handle changes to an input element within the form.  
- Parameters:
  - **formConfig**: `ApplicationFormConfiguration` - The form configuration for which this handler is bound  
  - **event**: `Event` - An input change event within the form  
- Returns: `void`  
- Inherited from `DocumentDirectory._onChangeForm`

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```
- Description: A generic event handler for action clicks which can be extended by subclasses. Action handlers  
  defined in `DEFAULT_OPTIONS` are called first. This method is only called for actions which have no defined handler.  
- Parameters:
  - **event**: `PointerEvent` - The originating click event  
  - **target**: `HTMLElement` - The capturing HTML element which defined a `[data-action]`  
- Returns: `void`  
- Inherited from `DocumentDirectory._onClickAction`

```typescript
_onClickEntry(
  event: PointerEvent,
  target: HTMLElement,
  options?: { _skipDeprecation?: boolean },
): Promise<void>
```
- Description: Handle activating a directory entry.  
- Parameters:
  - **event**: `PointerEvent` - The triggering click event.  
  - **target**: `HTMLElement` - The action target element.  
  - **options** (optional):  
    - **_skipDeprecation?**: `boolean` - Internal use only.  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory._onClickEntry`

```typescript
_onClickTab(event: PointerEvent): void
```
- Description: Handle click events on a tab within the Application.  
- Parameters:
  - **event**: `PointerEvent`  
- Returns: `void`  
- Inherited from `DocumentDirectory._onClickTab`

```typescript
_onCreateEntry(event: PointerEvent, target: HTMLElement): any
```
- Description: Handle creating a new entry in this directory.  
- Parameters:
  - **event**: `PointerEvent` - The triggering click event.  
  - **target**: `HTMLElement` - The action target element.  
- Returns: `any`  
- Inherited from `DocumentDirectory._onCreateEntry`

```typescript
_onCreateFolder(event: PointerEvent, target: HTMLElement): void
```
- Description: Handle creating a new folder in this directory.  
- Parameters:
  - **event**: `PointerEvent` - The triggering click event.  
  - **target**: `HTMLElement` - The action target element.  
- Returns: `void`  
- Inherited from `DocumentDirectory._onCreateFolder`

```typescript
_onDeactivate(): void
```
- Description: Actions performed when this tab is deactivated in the sidebar.  
- Returns: `void`  
- Inherited from `DocumentDirectory._onDeactivate`

```typescript
_onDragHighlight(event: DragEvent): void
```
- Description: Highlight folders as drop targets when a drag event enters or exits their area.  
- Parameters:
  - **event**: `DragEvent` - The in-progress drag event.  
- Returns: `void`  
- Inherited from `DocumentDirectory._onDragHighlight`

```typescript
_onDragOver(event: DragEvent): void
```
- Description: Handle drag events over the directory.  
- Parameters:
  - **event**: `DragEvent`  
- Returns: `void`  
- Inherited from `DocumentDirectory._onDragOver`

```typescript
_onMatchSearchEntry(
  query: string,
  entryIds: Set<string>,
  element: HTMLElement,
  options?: object,
): void
```
- Description: Handle matching a given directory entry with the search filter.  
- Parameters:
  - **query**: `string` - The input search string.  
  - **entryIds**: `Set<string>` - The matched directory entry IDs.  
  - **element**: `HTMLElement` - The candidate entry element.  
  - **options** (optional): `object = {}` - Additional options for subclass-specific behavior.  
- Returns: `void`  
- Inherited from `DocumentDirectory._onMatchSearchEntry`

```typescript
_onPosition(position: ApplicationPosition): void
```
- Description: Actions performed after the Application is re-positioned.  
- Parameters:
  - **position**: `ApplicationPosition` - The requested application position  
- Returns: `void`  
- Inherited from `DocumentDirectory._onPosition`

```typescript
_onSearchFilter(
  event: KeyboardEvent,
  query: string,
  rgx: RegExp,
  html: HTMLElement
): void
```
- Description: Handle directory searching and filtering.  
- Parameters:
  - **event**: `KeyboardEvent` - The keyboard input event.  
  - **query**: `string` - The input search string.  
  - **rgx**: `RegExp` - The regular expression query that should be matched against.  
  - **html**: `HTMLElement` - The container to filter entries from.  
- Returns: `void`  
- Inherited from `DocumentDirectory._onSearchFilter`

```typescript
_onSubmitForm(
  formConfig: ApplicationFormConfiguration,
  event: Event | SubmitEvent,
): Promise<void>
```
- Description: Handle submission for an Application which uses the form element.  
- Parameters:
  - **formConfig**: `ApplicationFormConfiguration` - The form configuration for which this handler is bound  
  - **event**: `Event | SubmitEvent` - The form submission event  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory._onSubmitForm`

```typescript
_onToggleFolder(
  event: PointerEvent,
  target: HTMLElement,
  options?: { _skipDeprecation?: boolean },
): any
```
- Description: Handle toggling a folder's expanded state.  
- Parameters:
  - **event**: `PointerEvent` - The triggering click event.  
  - **target**: `HTMLElement` - The action target element.  
  - **options** (optional):  
    - **_skipDeprecation?**: `boolean` - Internal use only.  
- Returns: `any`  
- Inherited from `DocumentDirectory._onToggleFolder`

```typescript
_organizeDroppedFoldersAndDocuments(
  folder: documents.Folder,
  targetFolder?: documents.Folder,
): Promise<{
  documentsToCreate: object[] | documents.Item[];
  foldersToCreate: documents.Folder[];
}>
```
- Description: Organize a dropped folder and its children into a list of folders and documents to create.  
- Parameters:
  - **folder**: `documents.Folder` - The dropped folder.  
  - **targetFolder** (optional): `documents.Folder` - A folder to import into if not the directory root.  
- Returns: `Promise` resolving to an object containing arrays of documents and folders to create.  
- Inherited from `DocumentDirectory._organizeDroppedFoldersAndDocuments`

```typescript
_preClose(options: HandlebarsRenderOptions): Promise<void>
```
- Description: Actions performed before closing the Application. Pre-close steps are awaited by the close process.  
- Parameters:
  - **options**: `HandlebarsRenderOptions` - Provided render options  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory._preClose`

```typescript
_preFirstRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```
- Description: Actions performed before a first render of the Application.  
- Parameters:
  - **context**: `ApplicationRenderContext` - Prepared context data  
  - **options**: `HandlebarsRenderOptions` - Provided render options  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory._preFirstRender`

```typescript
_prepareDirectoryContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```
- Description: Prepare render context for the directory part.  
- Parameters:
  - **context**: `ApplicationRenderContext`  
  - **options**: `HandlebarsRenderOptions`  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory._prepareDirectoryContext`

```typescript
_prepareFooterContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```
- Description: Prepare render context for the footer part.  
- Parameters:
  - **context**: `ApplicationRenderContext`  
  - **options**: `HandlebarsRenderOptions`  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory._prepareFooterContext`

```typescript
_prepareHeaderContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```
- Description: Prepare render context for the header part.  
- Parameters:
  - **context**: `ApplicationRenderContext`  
  - **options**: `HandlebarsRenderOptions`  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory._prepareHeaderContext`

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```
- Description: Prepare application tab data for a single tab group.  
- Parameters:
  - **group**: `string` - The ID of the tab group to prepare  
- Returns: `Record<string, ApplicationTab>`  
- Inherited from `DocumentDirectory._prepareTabs`

```typescript
_prePosition(position: ApplicationPosition): void
```
- Description: Actions performed before the Application is re-positioned. Pre-position steps are not awaited because `setPosition` is synchronous.  
- Parameters:
  - **position**: `ApplicationPosition` - The requested application position  
- Returns: `void`  
- Inherited from `DocumentDirectory._prePosition`

```typescript
_preRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<void>
```
- Description: Actions performed before any render of the Application. Pre-render steps are awaited by the render process.  
- Parameters:
  - **context**: `ApplicationRenderContext` - Prepared context data  
  - **options**: `HandlebarsRenderOptions` - Provided render options  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory._preRender`

```typescript
_removeElement(element: HTMLElement): void
```
- Description: Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.  
- Parameters:
  - **element**: `HTMLElement` - The element to be removed  
- Returns: `void`  
- Inherited from `DocumentDirectory._removeElement`

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```
- Description: Render a header control button.  
- Parameters:
  - **control**: `ApplicationHeaderControlsEntry`  
- Returns: `HTMLLIElement`  
- Inherited from `DocumentDirectory._renderHeaderControl`

```typescript
_replaceHTML(
  result: any,
  content: HTMLElement,
  options: HandlebarsRenderOptions
): void
```
- Description: Replace the HTML of the application with the result provided by the rendering backend.  
  An Application subclass should implement this method in order for the Application to be renderable.  
- Parameters:
  - **result**: `any` - The result returned by the application rendering backend  
  - **content**: `HTMLElement` - The content element into which the rendered result must be inserted  
  - **options**: `HandlebarsRenderOptions` - Options which configure application rendering behavior  
- Returns: `void`  
- Inherited from `DocumentDirectory._replaceHTML`

```typescript
_tearDown(options: ApplicationClosingOptions): void
```
- Description: Remove elements from the DOM and trigger garbage collection as part of application closure.  
- Parameters:
  - **options**: `ApplicationClosingOptions`  
- Returns: `void`  
- Inherited from `DocumentDirectory._tearDown`

```typescript
_updateFrame(options: HandlebarsRenderOptions): void
```
- Description: When the Application is rendered, optionally update aspects of the window frame.  
- Parameters:
  - **options**: `HandlebarsRenderOptions` - Options provided at render-time  
- Returns: `void`  
- Inherited from `DocumentDirectory._updateFrame`

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```
- Description:  
  Translate a requested application position update into a resolved allowed position for the Application.  
  Subclasses may override this method to implement more advanced positioning behavior.  
- Parameters:
  - **position**: `ApplicationPosition` - Requested Application positioning data  
- Returns: `ApplicationPosition` - Resolved Application positioning data  
- Inherited from `DocumentDirectory._updatePosition`

---

## Static Methods

```typescript
inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```
- Description: Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.  
- Returns: `Generator<typeof ApplicationV2, void, unknown>`  
- See: `ApplicationV2.BASE_APPLICATION`  
- Inherited from `DocumentDirectory.inheritanceChain`

```typescript
parseCSSDimension(style: string, parentDimension: number): number | void
```
- Description: Parse a CSS style rule into a number of pixels which apply to that dimension.  
- Parameters:
  - **style**: `string` - The CSS style rule  
  - **parentDimension**: `number` - The relevant dimension of the parent element  
- Returns: `number | void` - The parsed style dimension in pixels  
- Inherited from `DocumentDirectory.parseCSSDimension`

```typescript
waitForImages(element: HTMLElement): Promise<void>
```
- Description: Wait for any images in the given element to load.  
- Parameters:
  - **element**: `HTMLElement` - The element.  
- Returns: `Promise<void>`  
- Inherited from `DocumentDirectory.waitForImages`

---

*DocumentDirectory class and associated types referenced in this documentation can be found within the [Foundry VTT API Documentation](https://foundryvtt.com/api/modules/foundry.applications.sidebar.html).*