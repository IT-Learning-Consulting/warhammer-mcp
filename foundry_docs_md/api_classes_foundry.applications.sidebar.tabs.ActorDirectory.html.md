# ActorDirectory

The World Actor directory listing.

## Hierarchy
- [DocumentDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html)
- **ActorDirectory**

---

## Properties

### options  
Type: `Readonly<DocumentDirectoryConfiguration>`  
Application instance configuration options.  
Inherited from `DocumentDirectory.options`

### position  
Type: `ApplicationPosition = ...`  
The current position of the application with respect to the `window.document.body`.  
Inherited from `DocumentDirectory.position`

### tabGroups  
Type: `Record<string, null | string> = ...`  
If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.  
Inherited from `DocumentDirectory.tabGroups`

---

## Static Properties

### BASE_APPLICATION  
Type: `typeof ApplicationV2 = ApplicationV2`  
Designates which upstream Application class in this class' inheritance chain is the base application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the `BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the `BASE_APPLICATION` are not dispatched.  
Inherited from `DocumentDirectory.BASE_APPLICATION`

### DEFAULT_OPTIONS  
Type: `{ collection: string } = ...`  
Overrides `DocumentDirectory.DEFAULT_OPTIONS`.

### emittedEvents  
Type: `readonly ["render", "close", "position", "activate", "deactivate"] = ...`  
Inherited from `DocumentDirectory.emittedEvents`

### PARTS  
Type: `{ directory: { scrollable: string[]; template: string }; footer: { template: string }; header: { template: string } } = ...`  
Inherited from `DocumentDirectory.PARTS`

### RENDER_STATES  
Type: `Record<string, number> = ...`  
The sequence of rendering states that describe the Application life-cycle.  
Inherited from `DocumentDirectory.RENDER_STATES`

### tabName  
Type: `string = "actors"`  
Overrides `DocumentDirectory.tabName`

### TABS  
Type: `Record<string, ApplicationTabsConfiguration> = {}`  
Configuration of application tabs, with an entry per tab group.  
Inherited from `DocumentDirectory.TABS`

### _entryPartial  
Type: `string = "templates/sidebar/partials/document-partial.hbs"`  
The path to the template used to render a single entry within the directory.  
Inherited from `DocumentDirectory._entryPartial`

### _folderPartial  
Type: `string = "templates/sidebar/partials/folder-partial.hbs"`  
The path to the template used to render a single folder within the directory.  
Inherited from `DocumentDirectory._folderPartial`

---

## Accessors

### active  
Getter returns: `boolean`  
Whether this tab is currently active in the sidebar.  
Inherited from `DocumentDirectory.active`

### classList  
Getter returns: `DOMTokenList`  
The CSS class list of this Application instance.  
Inherited from `DocumentDirectory.classList`

### collection  
Getter returns: `DirectoryCollection`  
The Document collection that this directory represents.  
Inherited from `DocumentDirectory.collection`

### documentClass  
Getter returns: `Constructor<TDocument>`  
The implementation of the Document type that this directory represents.  
Inherited from `DocumentDirectory.documentClass`

### documentName  
Getter returns: `string`  
The named Document type that this directory represents.  
Inherited from `DocumentDirectory.documentName`

### element  
Getter returns: `HTMLElement`  
The HTMLElement which renders this Application into the DOM.  
Inherited from `DocumentDirectory.element`

### form  
Getter returns: `null | HTMLFormElement`  
Does this Application have a top-level form element?  
Inherited from `DocumentDirectory.form`

### hasFrame  
Getter returns: `boolean`  
Does this Application instance render within an outer window frame?  
Inherited from `DocumentDirectory.hasFrame`

### id  
Getter returns: `string`  
The HTML element ID of this Application instance. This provides a readonly view into the internal ID used by this application. This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.  
Inherited from `DocumentDirectory.id`

### isPopout  
Getter returns: `boolean`  
Whether this is the popped-out tab or the in-sidebar one.  
Inherited from `DocumentDirectory.isPopout`

### minimized  
Getter returns: `boolean`  
Is this Application instance currently minimized?  
Inherited from `DocumentDirectory.minimized`

### popout  
Getter returns: `void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>`  
A reference to the popped-out version of this tab, if one exists.  
Inherited from `DocumentDirectory.popout`

### rendered  
Getter returns: `boolean`  
Is this Application instance currently rendered?  
Inherited from `DocumentDirectory.rendered`

### state  
Getter returns: `number`  
The current render state of the Application.  
Inherited from `DocumentDirectory.state`

### tabName  
Getter returns: `string`  
The base name of the sidebar tab.  
Inherited from `DocumentDirectory.tabName`

### title  
Getter returns: `string`  
Inherited from `DocumentDirectory.title`

### window  
Getter returns an object with the following properties:
- `close: HTMLButtonElement`
- `content: HTMLElement`
- `controls: HTMLButtonElement`
- `controlsDropdown: HTMLDivElement`
- `header: HTMLElement`
- `icon: HTMLElement`
- `onDrag: Function`
- `onResize: Function`
- `pointerMoveThrottle: boolean`
- `pointerStartPosition: ApplicationPosition`
- `resize: HTMLElement`
- `title: HTMLHeadingElement`

Convenience references to window header elements.  
Inherited from `DocumentDirectory.window`

---

## Methods

### _canDragStart
```typescript
_canDragStart(selector: any): boolean
```
Overrides `DocumentDirectory._canDragStart`

- **Parameters**
  - `selector: any`
- **Returns:** `boolean`

---

### _canRender
```typescript
_canRender(options: any): false | void
```
Overrides `DocumentDirectory._canRender`

- **Parameters**
  - `options: any`
- **Returns:** `false | void`

---

### _configureRenderParts
```typescript
_configureRenderParts(options: any): any
```
Overrides `DocumentDirectory._configureRenderParts`

- **Parameters**
  - `options: any`
- **Returns:** `any`

---

### _getEntryContextOptions
```typescript
_getEntryContextOptions(): {
  callback: (li: any) => void;
  condition: (li: any) => boolean;
  icon: string;
  name: string;
}[]
```
Overrides `DocumentDirectory._getEntryContextOptions`

- **Returns**: Array of objects with:
  - `callback: (li: any) => void`
  - `condition: (li: any) => boolean`
  - `icon: string`
  - `name: string`

---

### _initializeApplicationOptions
```typescript
_initializeApplicationOptions(options: any): any
```
Overrides `DocumentDirectory._initializeApplicationOptions`

- **Parameters**
  - `options: any`
- **Returns:** `any`

---

### _onClose
```typescript
_onClose(options: any): void
```
Overrides `DocumentDirectory._onClose`

- **Parameters**
  - `options: any`
- **Returns:** `void`

---

### _onDragStart
```typescript
_onDragStart(event: any): undefined | false
```
Overrides `DocumentDirectory._onDragStart`

- **Parameters**
  - `event: any`
- **Returns:** `undefined | false`

---

### _onDrop
```typescript
_onDrop(event: any): undefined | Promise<void>
```
Inherited from `DocumentDirectory._onDrop`

- **Parameters**
  - `event: any`
- **Returns:** `undefined | Promise<void>`

---

### _onFirstRender
```typescript
_onFirstRender(context: any, options: any): Promise<void>
```
Inherited from `DocumentDirectory._onFirstRender`

- **Parameters**
  - `context: any`
  - `options: any`
- **Returns:** `Promise<void>`

---

### _onRender
```typescript
_onRender(context: any, options: any): Promise<void>
```
Inherited from `DocumentDirectory._onRender`

- **Parameters**
  - `context: any`
  - `options: any`
- **Returns:** `Promise<void>`

---

### _prepareContext
```typescript
_prepareContext(
  options: any
): Promise<
  ApplicationRenderContext & {
    canCreateEntry: boolean;
    canCreateFolder: boolean;
    documentName: string;
    folderIcon: string;
    sidebarIcon: any;
  }
>
```
Overrides `DocumentDirectory._prepareContext`

- **Parameters**
  - `options: any`
- **Returns:** Promise of context augmented with creation and folder info

---

### _preparePartContext
```typescript
_preparePartContext(partId: any, context: any, options: any): Promise<any>
```
Inherited from `DocumentDirectory._preparePartContext`

- **Parameters**
  - `partId: any`
  - `context: any`
  - `options: any`
- **Returns:** `Promise<any>`

---

### _preSyncPartState
```typescript
_preSyncPartState(
  partId: any,
  newElement: any,
  priorElement: any,
  state: any
): void
```
Inherited from `DocumentDirectory._preSyncPartState`

- **Parameters**
  - `partId: any`
  - `newElement: any`
  - `priorElement: any`
  - `state: any`
- **Returns:** `void`

---

### _renderFrame
```typescript
_renderFrame(options: any): Promise<HTMLElement>
```
Inherited from `DocumentDirectory._renderFrame`

- **Parameters**
  - `options: any`
- **Returns:** `Promise<HTMLElement>`

---

### _renderHTML
```typescript
_renderHTML(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions,
): Promise<any>
```
Abstract. An Application subclass must implement this method in order for the Application to be renderable.  
Inherited from `DocumentDirectory._renderHTML`

- **Parameters**
  - `context: ApplicationRenderContext` - Context data for the render operation
  - `options: HandlebarsRenderOptions` - Options which configure application rendering behavior
- **Returns:** `Promise<any>` - The result of HTML rendering (passed to `_replaceHTML`)

---

### _syncPartState
```typescript
_syncPartState(
  partId: any,
  newElement: any,
  priorElement: any,
  state: any
): void
```
Inherited from `DocumentDirectory._syncPartState`

- **Parameters**
  - `partId: any`
  - `newElement: any`
  - `priorElement: any`
  - `state: any`
- **Returns:** `void`

---

### activate
```typescript
activate(): void
```
Activate this tab in the sidebar.  
Inherited from `DocumentDirectory.activate`

- **Returns:** `void`

---

### addEventListener
```typescript
addEventListener(
  type: string,
  listener: EmittedEventListener,
  options?: { once?: boolean }
): void
```
Add a new event listener for a certain type of event.  
Inherited from `DocumentDirectory.addEventListener`

- **Parameters**
  - `type: string` - The type of event being registered for
  - `listener: EmittedEventListener` - The listener function called when the event occurs
  - `options` (optional):  
    - `once?: boolean` - Should the event only be responded to once and then removed
- **Returns:** `void`

See [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

---

### bringToFront
```typescript
bringToFront(): void
```
Bring this Application window to the front of the rendering stack by increasing its z-index.  
Inherited from `DocumentDirectory.bringToFront`

- **Returns:** `void`

---

### changeTab
```typescript
changeTab(
  tab: string,
  group: string,
  options?: {
    event?: Event;
    force?: boolean;
    navElement?: HTMLElement;
    updatePosition?: boolean;
  }
): void
```
Change the active tab within a tab group in this Application instance.  
Inherited from `DocumentDirectory.changeTab`

- **Parameters**
  - `tab: string` - The name of the tab which should become active
  - `group: string` - The name of the tab group which defines the set of tabs
  - `options` (optional):
    - `event?: Event` - An interaction event which caused the tab change, if any
    - `force?: boolean` - Force changing the tab even if the new tab is already active
    - `navElement?: HTMLElement` - An explicit navigation element being modified
    - `updatePosition?: boolean` - Update application position after changing the tab?
- **Returns:** `void`

---

### close
```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<ActorDirectory>
```
Close the Application, removing it from the DOM.  
Inherited from `DocumentDirectory.close`

- **Parameters**
  - `options` (optional): Options which modify how the application is closed.
- **Returns:** `Promise<ActorDirectory>` - A Promise which resolves to the closed Application instance

---

### collapseAll
```typescript
collapseAll(): void
```
Collapse all open folders in this directory.  
Inherited from `DocumentDirectory.collapseAll`

- **Returns:** `void`

---

### dispatchEvent
```typescript
dispatchEvent(event: Event): boolean
```
Dispatch an event on this target.  
Inherited from `DocumentDirectory.dispatchEvent`

- **Parameters**
  - `event: Event` - The Event to dispatch
- **Returns:** `boolean` - Was default behavior for the event prevented?

See [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

---

### maximize
```typescript
maximize(): Promise<void>
```
Restore the Application to its original dimensions.  
Inherited from `DocumentDirectory.maximize`

- **Returns:** `Promise<void>`

---

### minimize
```typescript
minimize(): Promise<void>
```
Minimize the Application, collapsing it to a minimal header.  
Inherited from `DocumentDirectory.minimize`

- **Returns:** `Promise<void>`

---

### removeEventListener
```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```
Remove an event listener for a certain type of event.  
Inherited from `DocumentDirectory.removeEventListener`

- **Parameters**
  - `type: string` - The type of event being removed
  - `listener: EmittedEventListener` - The listener function being removed
- **Returns:** `void`

See [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

---

### render
```typescript
render(options: any, _options: any): Promise<ActorDirectory>
```
Inherited from `DocumentDirectory.render`

- **Parameters**
  - `options: any`
  - `_options: any`
- **Returns:** `Promise<ActorDirectory>`

---

### renderPopout
```typescript
renderPopout(): Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>
```
Pop-out this sidebar tab as a new application.  
Inherited from `DocumentDirectory.renderPopout`

- **Returns:** `Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>`

---

### setPosition
```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```
Update the Application element position using provided data which is merged with the prior position.  
Inherited from `DocumentDirectory.setPosition`

- **Parameters**
  - `position` (optional): New Application positioning data
- **Returns:** `void | ApplicationPosition` - The updated application position

---

### submit
```typescript
submit(submitOptions?: object): Promise<any>
```
Programmatically submit an ApplicationV2 instance which implements a single top-level form.  
Inherited from `DocumentDirectory.submit`

- **Parameters**
  - `submitOptions` (optional): Arbitrary options which are supported by and provided to the configured form submission handler.
- **Returns:** `Promise<any>` - A promise that resolves to the returned result of the form submission handler, if any.

---

### toggleControls
```typescript
toggleControls(expanded?: boolean, options?: { animate?: boolean }): Promise<void>
```
Toggle display of the Application controls menu. Only applicable to window Applications.  
Inherited from `DocumentDirectory.toggleControls`

- **Parameters**
  - `expanded` (optional): Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its current value
  - `options` (optional):
    - `animate?: boolean` - Animate the controls toggling
- **Returns:** `Promise<void>` - A Promise which resolves once the control expansion animation is complete

---

### _attachFrameListeners
```typescript
_attachFrameListeners(): void
```
Attach event listeners to the Application frame.  
Inherited from `DocumentDirectory._attachFrameListeners`

- **Returns:** `void`

---

### _canCreateEntry
```typescript
_canCreateEntry(): boolean
```
Determine if the current user has permission to create directory entries.  
Inherited from `DocumentDirectory._canCreateEntry`

- **Returns:** `boolean`

---

### _canCreateFolder
```typescript
_canCreateFolder(): boolean
```
Determine if the current user has permission to create folders in this directory.  
Inherited from `DocumentDirectory._canCreateFolder`

- **Returns:** `boolean`

---

### _canDragDrop
```typescript
_canDragDrop(selector: string): boolean
```
Determine if drop operations are permitted.  
Inherited from `DocumentDirectory._canDragDrop`

- **Parameters**
  - `selector: string` - The candidate HTML selector for dragging
- **Returns:** `boolean`

---

### _configureRenderOptions
```typescript
_configureRenderOptions(options: HandlebarsRenderOptions): void
```
Modify the provided options passed to a render request.  
Inherited from `DocumentDirectory._configureRenderOptions`

- **Parameters**
  - `options: HandlebarsRenderOptions`
- **Returns:** `void`

---

### _createContextMenu
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
Create a ContextMenu instance used in this Application.  
Inherited from `DocumentDirectory._createContextMenu`

- **Parameters**
  - `handler`: A handler function that provides initial context options
  - `selector`: A CSS selector to which the ContextMenu will be bound
  - `options` (optional):
    - `container?: HTMLElement` - A parent HTMLElement which contains the selector target
    - `hookName?: string` - The hook name
    - `parentClassHooks?: boolean` - Whether to call hooks for the parent classes in the inheritance chain
- **Returns:** `null | ContextMenu` - A created ContextMenu or null if no menu items were defined

---

### _createContextMenus
```typescript
_createContextMenus(): void
```
Register context menu entries and fire hooks.  
Inherited from `DocumentDirectory._createContextMenus`

- **Returns:** `void`

---

### _createDroppedEntry
```typescript
_createDroppedEntry(
  entry: DirectoryMixinEntry,
  updates?: object
): Promise<documents.Actor>
```
Create a new entry in this directory from one that was dropped on it.  
Inherited from `DocumentDirectory._createDroppedEntry`

- **Parameters**
  - `entry: DirectoryMixinEntry` - The dropped entry
  - `updates` (optional): Modifications to the creation data
- **Returns:** `Promise<documents.Actor>`

---

### _createDroppedFolderContent
```typescript
_createDroppedFolderContent(
  folder: documents.Folder,
  targetFolder?: documents.Folder
): Promise<documents.Folder[]>
```
Import a dropped folder and its children into this collection if they do not already exist.  
Inherited from `DocumentDirectory._createDroppedFolderContent`

- **Parameters**
  - `folder: documents.Folder` - The folder being dropped
  - `targetFolder` (optional): A folder to import into if not the directory root
- **Returns:** `Promise<documents.Folder[]>`

---

### _createDroppedFolderDocuments
```typescript
_createDroppedFolderDocuments(
  folder: documents.Folder,
  documents: object[] | documents.Actor[]
): Promise<void>
```
Create a set of documents in a dropped folder.  
Inherited from `DocumentDirectory._createDroppedFolderDocuments`

- **Parameters**
  - `folder: documents.Folder` - The dropped folder
  - `documents: object[] | documents.Actor[]` - The documents to create, or their indices
- **Returns:** `Promise<void>`

---

### _entryAlreadyExists
```typescript
_entryAlreadyExists(entry: ClientDocument): boolean
```
Test if the given entry is already present in this directory.  
Inherited from `DocumentDirectory._entryAlreadyExists`

- **Parameters**
  - `entry: ClientDocument` - The directory entry
- **Returns:** `boolean`

---

### _entryBelongsToFolder
```typescript
_entryBelongsToFolder(entry: DirectoryMixinEntry, folder: string): boolean
```
Determine whether a given directory entry belongs to the given folder.  
Inherited from `DocumentDirectory._entryBelongsToFolder`

- **Parameters**
  - `entry: DirectoryMixinEntry` - The entry
  - `folder: string` - The target folder ID
- **Returns:** `boolean`

---

### _getDroppedEntryFromData
```typescript
_getDroppedEntryFromData(data: object): Promise<ClientDocument>
```
Get the entry instance from its dropped data.  
Inherited from `DocumentDirectory._getDroppedEntryFromData`

- **Parameters**
  - `data: object` - The drag data
- **Returns:** `Promise<ClientDocument>`
- **Throws:** If the correct instance type could not be retrieved

---

### _getEntryDragData
```typescript
_getEntryDragData(entryId: string): any
```
Get drag data for an entry in this directory.  
Inherited from `DocumentDirectory._getEntryDragData`

- **Parameters**
  - `entryId: string` - The entry's ID
- **Returns:** `any`

---

### _getFolderContextOptions
```typescript
_getFolderContextOptions(): ContextMenuEntry[]
```
Get context menu entries for folders in this directory.  
Inherited from `DocumentDirectory._getFolderContextOptions`

- **Returns:** `ContextMenuEntry[]`

---

### _getFolderDragData
```typescript
_getFolderDragData(folderId: string): any
```
Get drag data for a folder in this directory.  
Inherited from `DocumentDirectory._getFolderDragData`

- **Parameters**
  - `folderId: string` - The folder ID
- **Returns:** `any`

---

### _getHeaderControls
```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```
Configure the array of header control menu options.  
Inherited from `DocumentDirectory._getHeaderControls`

- **Returns:** `ApplicationHeaderControlsEntry[]`

---

### _getTabsConfig
```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```
Get the configuration for a tabs group.  
Inherited from `DocumentDirectory._getTabsConfig`

- **Parameters**
  - `group: string` - The ID of a tabs group
- **Returns:** `null | ApplicationTabsConfiguration`

---

### _handleDroppedEntry
```typescript
_handleDroppedEntry(target: HTMLElement, data: object): Promise<void>
```
Handle dropping a new entry into this directory.  
Inherited from `DocumentDirectory._handleDroppedEntry`

- **Parameters**
  - `target: HTMLElement` - The drop target element
  - `data: object` - The drop data
- **Returns:** `Promise<void>`

---

### _handleDroppedFolder
```typescript
_handleDroppedFolder(target: HTMLElement, data: object): Promise<void>
```
Handle dropping a folder onto the directory.  
Inherited from `DocumentDirectory._handleDroppedFolder`

- **Parameters**
  - `target: HTMLElement` - The drop target element
  - `data: object` - The drop data
- **Returns:** `Promise<void>`

---

### _handleDroppedForeignFolder
```typescript
_handleDroppedForeignFolder(
  folder: documents.Folder,
  closestFolderId: string,
  sortData: object
): Promise<null | { folder: documents.Folder; sortNeeded: boolean }>
```
Handle importing a new folder's into the directory.  
Inherited from `DocumentDirectory._handleDroppedForeignFolder`

- **Parameters**
  - `folder: documents.Folder` - The dropped folder
  - `closestFolderId: string` - The ID of the closest folder to the drop target
  - `sortData: object` - Sort data for the folder
- **Returns:** `Promise<null | { folder: documents.Folder; sortNeeded: boolean }>`

---

### _headerControlButtons
```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```
Iterate over header control buttons, filtering for controls which are visible for the current client.  
Inherited from `DocumentDirectory._headerControlButtons`

- **Yields:** `ApplicationHeaderControlsEntry`

---

### _insertElement
```typescript
_insertElement(element: HTMLElement): void
```
Insert the application HTML element into the DOM. Subclasses may override this method to customize how the application is inserted.  
Inherited from `DocumentDirectory._insertElement`

- **Parameters**
  - `element: HTMLElement` - The element to insert
- **Returns:** `void`

---

### _matchSearchEntries
```typescript
_matchSearchEntries(
  query: RegExp,
  entryIds: Set<string>,
  folderIds: Set<string>,
  autoExpandIds: Set<string>,
  options?: object
): void
```
Identify entries in the collection which match a provided search query.  
Inherited from `DocumentDirectory._matchSearchEntries`

- **Parameters**
  - `query: RegExp` - The search query
  - `entryIds: Set<string>` - The set of matched entry IDs
  - `folderIds: Set<string>` - The set of matched folder IDs
  - `autoExpandIds: Set<string>` - The set of folder IDs that should be auto-expanded
  - `options` (optional): Additional options for subclass-specific behavior
- **Returns:** `void`

---

### _matchSearchFolders
```typescript
_matchSearchFolders(
  query: RegExp,
  folderIds: Set<string>,
  autoExpandIds: Set<string>,
  options?: object
): void
```
Identify folders in the collection which match a provided search query.  
Inherited from `DocumentDirectory._matchSearchFolders`

- **Parameters**
  - `query: RegExp` - The search query
  - `folderIds: Set<string>` - The set of matched folder IDs
  - `autoExpandIds: Set<string>` - The set of folder IDs that should be auto-expanded
  - `options` (optional): Additional options for subclass-specific behavior
- **Returns:** `void`

---

### _onActivate
```typescript
_onActivate(): void
```
Actions performed when this tab is activated in the sidebar.  
Inherited from `DocumentDirectory._onActivate`

- **Returns:** `void`

---

### _onChangeForm
```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```
Handle changes to an input element within the form.  
Inherited from `DocumentDirectory._onChangeForm`

- **Parameters**
  - `formConfig: ApplicationFormConfiguration` - The form configuration for which this handler is bound
  - `event: Event` - An input change event within the form
- **Returns:** `void`

---

### _onClickAction
```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```
A generic event handler for action clicks which can be extended by subclasses. Action handlers defined in `DEFAULT_OPTIONS` are called first. This method is only called for actions which have no defined handler.  
Inherited from `DocumentDirectory._onClickAction`

- **Parameters**
  - `event: PointerEvent` - The originating click event
  - `target: HTMLElement` - The capturing HTML element which defined a `[data-action]`
- **Returns:** `void`

---

### _onClickEntry
```typescript
_onClickEntry(
  event: PointerEvent,
  target: HTMLElement,
  options?: { _skipDeprecation?: boolean }
): Promise<void>
```
Handle activating a directory entry.  
Inherited from `DocumentDirectory._onClickEntry`

- **Parameters**
  - `event: PointerEvent` - The triggering click event
  - `target: HTMLElement` - The action target element
  - `options` (optional):
    - `_skipDeprecation?: boolean` - Internal use only
- **Returns:** `Promise<void>`

---

### _onClickTab
```typescript
_onClickTab(event: PointerEvent): void
```
Handle click events on a tab within the Application.  
Inherited from `DocumentDirectory._onClickTab`

- **Parameters**
  - `event: PointerEvent`
- **Returns:** `void`

---

### _onCreateEntry
```typescript
_onCreateEntry(event: PointerEvent, target: HTMLElement): any
```
Handle creating a new entry in this directory.  
Inherited from `DocumentDirectory._onCreateEntry`

- **Parameters**
  - `event: PointerEvent` - The triggering click event
  - `target: HTMLElement` - The action target element
- **Returns:** `any`

---

### _onCreateFolder
```typescript
_onCreateFolder(event: PointerEvent, target: HTMLElement): void
```
Handle creating a new folder in this directory.  
Inherited from `DocumentDirectory._onCreateFolder`

- **Parameters**
  - `event: PointerEvent` - The triggering click event
  - `target: HTMLElement` - The action target element
- **Returns:** `void`

---

### _onDeactivate
```typescript
_onDeactivate(): void
```
Actions performed when this tab is deactivated in the sidebar.  
Inherited from `DocumentDirectory._onDeactivate`

- **Returns:** `void`

---

### _onDragHighlight
```typescript
_onDragHighlight(event: DragEvent): void
```
Highlight folders as drop targets when a drag event enters or exits their area.  
Inherited from `DocumentDirectory._onDragHighlight`

- **Parameters**
  - `event: DragEvent` - The in-progress drag event
- **Returns:** `void`

---

### _onDragOver
```typescript
_onDragOver(event: DragEvent): void
```
Handle drag events over the directory.  
Inherited from `DocumentDirectory._onDragOver`

- **Parameters**
  - `event: DragEvent`
- **Returns:** `void`

---

### _onMatchSearchEntry
```typescript
_onMatchSearchEntry(
  query: string,
  entryIds: Set<string>,
  element: HTMLElement,
  options?: object
): void
```
Handle matching a given directory entry with the search filter.  
Inherited from `DocumentDirectory._onMatchSearchEntry`

- **Parameters**
  - `query: string` - The input search string
  - `entryIds: Set<string>` - The matched directory entry IDs
  - `element: HTMLElement` - The candidate entry element
  - `options` (optional): Additional options for subclass-specific behavior
- **Returns:** `void`

---

### _onPosition
```typescript
_onPosition(position: ApplicationPosition): void
```
Actions performed after the Application is re-positioned.  
Inherited from `DocumentDirectory._onPosition`

- **Parameters**
  - `position: ApplicationPosition` - The requested application position
- **Returns:** `void`

---

### _onSearchFilter
```typescript
_onSearchFilter(
  event: KeyboardEvent,
  query: string,
  rgx: RegExp,
  html: HTMLElement
): void
```
Handle directory searching and filtering.  
Inherited from `DocumentDirectory._onSearchFilter`

- **Parameters**
  - `event: KeyboardEvent` - The keyboard input event
  - `query: string` - The input search string
  - `rgx: RegExp` - The regular expression query that should be matched against
  - `html: HTMLElement` - The container to filter entries from
- **Returns:** `void`

---

### _onSubmitForm
```typescript
_onSubmitForm(
  formConfig: ApplicationFormConfiguration,
  event: Event | SubmitEvent
): Promise<void>
```
Handle submission for an Application which uses the form element.  
Inherited from `DocumentDirectory._onSubmitForm`

- **Parameters**
  - `formConfig: ApplicationFormConfiguration` - The form configuration for which this handler is bound
  - `event: Event | SubmitEvent` - The form submission event
- **Returns:** `Promise<void>`

---

### _onToggleFolder
```typescript
_onToggleFolder(
  event: PointerEvent,
  target: HTMLElement,
  options?: { _skipDeprecation?: boolean }
): any
```
Handle toggling a folder's expanded state.  
Inherited from `DocumentDirectory._onToggleFolder`

- **Parameters**
  - `event: PointerEvent` - The triggering click event
  - `target: HTMLElement` - The action target element
  - `options` (optional):
    - `_skipDeprecation?: boolean` - Internal use only
- **Returns:** `any`

---

### _organizeDroppedFoldersAndDocuments
```typescript
_organizeDroppedFoldersAndDocuments(
  folder: documents.Folder,
  targetFolder?: documents.Folder
): Promise<{
  documentsToCreate: object[] | documents.Actor[];
  foldersToCreate: documents.Folder[];
}>
```
Organize a dropped folder and its children into a list of folders and documents to create.  
Inherited from `DocumentDirectory._organizeDroppedFoldersAndDocuments`

- **Parameters**
  - `folder: documents.Folder` - The dropped folder
  - `targetFolder` (optional): A folder to import into if not the directory root
- **Returns:** Promise resolving to an object with:
  - `documentsToCreate: object[] | documents.Actor[]`
  - `foldersToCreate: documents.Folder[]`

---

### _preClose
```typescript
_preClose(options: HandlebarsRenderOptions): Promise<void>
```
Actions performed before closing the Application. Pre-close steps are awaited by the close process.  
Inherited from `DocumentDirectory._preClose`

- **Parameters**
  - `options: HandlebarsRenderOptions` - Provided render options
- **Returns:** `Promise<void>`

---

### _preFirstRender
```typescript
_preFirstRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```
Actions performed before a first render of the Application.  
Inherited from `DocumentDirectory._preFirstRender`

- **Parameters**
  - `context: ApplicationRenderContext` - Prepared context data
  - `options: HandlebarsRenderOptions` - Provided render options
- **Returns:** `Promise<void>`

---

### _prepareDirectoryContext
```typescript
_prepareDirectoryContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```
Prepare render context for the directory part.  
Inherited from `DocumentDirectory._prepareDirectoryContext`

- **Parameters**
  - `context: ApplicationRenderContext`
  - `options: HandlebarsRenderOptions`
- **Returns:** `Promise<void>`

---

### _prepareFooterContext
```typescript
_prepareFooterContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```
Prepare render context for the footer part.  
Inherited from `DocumentDirectory._prepareFooterContext`

- **Parameters**
  - `context: ApplicationRenderContext`
  - `options: HandlebarsRenderOptions`
- **Returns:** `Promise<void>`

---

### _prepareHeaderContext
```typescript
_prepareHeaderContext(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```
Prepare render context for the header part.  
Inherited from `DocumentDirectory._prepareHeaderContext`

- **Parameters**
  - `context: ApplicationRenderContext`
  - `options: HandlebarsRenderOptions`
- **Returns:** `Promise<void>`

---

### _prepareTabs
```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```
Prepare application tab data for a single tab group.  
Inherited from `DocumentDirectory._prepareTabs`

- **Parameters**
  - `group: string` - The ID of the tab group to prepare
- **Returns:** `Record<string, ApplicationTab>`

---

### _prePosition
```typescript
_prePosition(position: ApplicationPosition): void
```
Actions performed before the Application is re-positioned. Pre-position steps are not awaited because `setPosition` is synchronous.  
Inherited from `DocumentDirectory._prePosition`

- **Parameters**
  - `position: ApplicationPosition`
- **Returns:** `void`

---

### _preRender
```typescript
_preRender(
  context: ApplicationRenderContext,
  options: HandlebarsRenderOptions
): Promise<void>
```
Actions performed before any render of the Application. Pre-render steps are awaited by the render process.  
Inherited from `DocumentDirectory._preRender`

- **Parameters**
  - `context: ApplicationRenderContext`
  - `options: HandlebarsRenderOptions`
- **Returns:** `Promise<void>`

---

### _removeElement
```typescript
_removeElement(element: HTMLElement): void
```
Remove the application HTML element from the DOM. Subclasses may override this method to customize how the application element is removed.  
Inherited from `DocumentDirectory._removeElement`

- **Parameters**
  - `element: HTMLElement`
- **Returns:** `void`

---

### _renderHeaderControl
```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```
Render a header control button.  
Inherited from `DocumentDirectory._renderHeaderControl`

- **Parameters**
  - `control: ApplicationHeaderControlsEntry`
- **Returns:** `HTMLLIElement`

---

### _replaceHTML
```typescript
_replaceHTML(
  result: any,
  content: HTMLElement,
  options: HandlebarsRenderOptions
): void
```
Replace the HTML of the application with the result provided by the rendering backend. An Application subclass should implement this method in order for the Application to be renderable.  
Inherited from `DocumentDirectory._replaceHTML`

- **Parameters**
  - `result: any` - The result returned by the application rendering backend
  - `content: HTMLElement` - The content element into which the rendered result must be inserted
  - `options: HandlebarsRenderOptions` - Options which configure application rendering behavior
- **Returns:** `void`

---

### _tearDown
```typescript
_tearDown(options: ApplicationClosingOptions): void
```
Remove elements from the DOM and trigger garbage collection as part of application closure.  
Inherited from `DocumentDirectory._tearDown`

- **Parameters**
  - `options: ApplicationClosingOptions`
- **Returns:** `void`

---

### _updateFrame
```typescript
_updateFrame(options: HandlebarsRenderOptions): void
```
When the Application is rendered, optionally update aspects of the window frame.  
Inherited from `DocumentDirectory._updateFrame`

- **Parameters**
  - `options: HandlebarsRenderOptions`
- **Returns:** `void`

---

### _updatePosition
```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```
Translate a requested application position updated into a resolved allowed position for the Application. Subclasses may override this method to implement more advanced positioning behaviour.  
Inherited from `DocumentDirectory._updatePosition`

- **Parameters**
  - `position: ApplicationPosition` - Requested Application positioning data
- **Returns:** `ApplicationPosition` - Resolved Application positioning data

---

## Static Methods

### inheritanceChain
```typescript
inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```
Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.  
Inherited from `DocumentDirectory.inheritanceChain`

- **Returns:** A generator of constructor types up the inheritance chain

See [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

---

### parseCSSDimension
```typescript
parseCSSDimension(style: string, parentDimension: number): number | void
```
Parse a CSS style rule into a number of pixels which apply to that dimension.  
Inherited from `DocumentDirectory.parseCSSDimension`

- **Parameters**
  - `style: string` - The CSS style rule
  - `parentDimension: number` - The relevant dimension of the parent element
- **Returns:** The parsed style dimension in pixels or `void`

---

### waitForImages
```typescript
waitForImages(element: HTMLElement): Promise<void>
```
Wait for any images in the given element to load.  
Inherited from `DocumentDirectory.waitForImages`

- **Parameters**
  - `element: HTMLElement` - The element
- **Returns:** `Promise<void>`

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)