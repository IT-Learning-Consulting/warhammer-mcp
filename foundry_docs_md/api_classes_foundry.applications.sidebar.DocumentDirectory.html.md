# DocumentDirectory | Foundry Virtual Tabletop - API Documentation - Version 13

An abstract class for rendering a foldered directory of Documents.

**Mixes:**  
HandlebarsApplication

**Type Parameters:**  
`TDocument = ClientDocument`

**Hierarchy:**  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.sidebar.DocumentDirectory)

```typescript
AbstractSidebarTab<
    DocumentDirectoryConfiguration,
    HandlebarsRenderOptions,
    this,
>
DocumentDirectory
```

Subclasses include:  
- [Compendium](https://foundryvtt.com/api/classes/foundry.applications.sidebar.apps.Compendium.html)  
- [ActorDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ActorDirectory.html)  
- [CardsDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.CardsDirectory.html)  
- [ItemDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.ItemDirectory.html)  
- [JournalDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.JournalDirectory.html)  
- [MacroDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.MacroDirectory.html)  
- [PlaylistDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.PlaylistDirectory.html)  
- [RollTableDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.RollTableDirectory.html)  
- [SceneDirectory](https://foundryvtt.com/api/classes/foundry.applications.sidebar.tabs.SceneDirectory.html)

---

## Properties

### options  
`options: Readonly<DocumentDirectoryConfiguration>`  
Application instance configuration options.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).options

### position  
`position: ApplicationPosition = ...`  
The current position of the application with respect to the `window.document.body`.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).position

### tabGroups  
`tabGroups: Record<string, null | string> = ...`  
If this Application uses tabbed navigation groups, this mapping is updated whenever the `changeTab` method is called. Reports the active tab for each group, with a value of `null` indicating no tab is active. Subclasses may override this property to define default tabs for each group.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).tabGroups

---

## Static Properties

### BASE_APPLICATION  
`BASE_APPLICATION: typeof ApplicationV2 = ApplicationV2`  
Designates which upstream Application class in this class' inheritance chain is the base application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the `BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the `BASE_APPLICATION` are not dispatched.

### DEFAULT_OPTIONS  
```typescript
DEFAULT_OPTIONS = {
    actions: {
        activateEntry: (...this: any, ...args: any[]) => Promise<void>;
        collapseFolders: (...this: any) => void;
        createEntry: (...this: any, ...args: any[]) => any;
        createFolder: (...this: any, ...args: any[]) => void;
        showIssues: (...this: any) => void;
        toggleFolder: (...this: any, ...args: any[]) => any;
        toggleSearch: (...this: any) => void;
        toggleSort: (...this: any) => void;
    };
    classes: string[];
    collection: null;
    renderUpdateKeys: string[];
} = ...
```

### emittedEvents  
`readonly emittedEvents: readonly ["render", "close", "position", "activate", "deactivate"] = ...`  

### PARTS  
```typescript
PARTS = {
    directory: { scrollable: string[]; template: string };
    footer: { template: string };
    header: { template: string };
} = ...
```

### RENDER_STATES  
`RENDER_STATES: Record<string, number> = ...`  
The sequence of rendering states that describe the Application life-cycle.

### tabName  
`tabName: string`  
The base name of the sidebar tab.

### TABS  
`TABS: Record<string, ApplicationTabsConfiguration> = {}`  
Configuration of application tabs, with an entry per tab group.

### _entryPartial  
`protected static _entryPartial: string = "templates/sidebar/partials/document-partial.hbs"`  
The path to the template used to render a single entry within the directory.

### _folderPartial  
`protected static _folderPartial: string = "templates/sidebar/partials/folder-partial.hbs"`  
The path to the template used to render a single folder within the directory.

---

## Accessors

### get active(): boolean  
Whether this tab is currently active in the sidebar.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab):

### get classList(): DOMTokenList  
The CSS class list of this Application instance.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### get collection(): DirectoryCollection  
The Document collection that this directory represents.

### get documentClass(): Constructor<TDocument>  
The implementation of the Document type that this directory represents.

### get documentName(): string  
The named Document type that this directory represents.

### get element(): HTMLElement  
The HTMLElement which renders this Application into the DOM.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### get form(): null | HTMLFormElement  
Does this Application have a top-level form element?  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### get hasFrame(): boolean  
Does this Application instance render within an outer window frame?  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### get id(): string  
The HTML element ID of this Application instance.  
This provides a readonly view into the internal ID used by this application.  
This getter should not be overridden by subclasses, which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during `_initializeApplicationOptions`.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### get isPopout(): boolean  
Whether this is the popped-out tab or the in-sidebar one.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### get minimized(): boolean  
Is this Application instance currently minimized?  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### get popout(): void | AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>  
A reference to the popped-out version of this tab, if one exists.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### get rendered(): boolean  
Is this Application instance currently rendered?  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### get state(): number  
The current render state of the Application.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### get tabName(): string  
The base name of the sidebar tab.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### get title(): string  
Overrides HandlebarsApplicationMixin(AbstractSidebarTab).title

### get window():  
```typescript
{
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
```
Convenience references to window header elements.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

---

## Methods

### _canRender(options: any): false | void  
Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._canRender

**Parameters:**  
- **options**: `any`

**Returns:** `false | void`

### _configureRenderParts(options: any): any  
Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._configureRenderParts

**Parameters:**  
- **options**: `any`

**Returns:** `any`

### _initializeApplicationOptions(options: any): any  
Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._initializeApplicationOptions

**Parameters:**  
- **options**: `any`

**Returns:** `any`

### _onClose(options: any): void  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._onClose

**Parameters:**  
- **options**: `any`

**Returns:** `void`

### _onDragStart(event: any): void  
**Parameters:**  
- **event**: `any`

**Returns:** `void`

### _onDrop(event: any): undefined | Promise<void>  
**Parameters:**  
- **event**: `any`

**Returns:** `undefined | Promise<void>`

### _onFirstRender(context: any, options: any): Promise<void>  
Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._onFirstRender

**Parameters:**  
- **context**: `any`  
- **options**: `any`

**Returns:** `Promise<void>`

### _onRender(context: any, options: any): Promise<void>  
Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._onRender

**Parameters:**  
- **context**: `any`  
- **options**: `any`

**Returns:** `Promise<void>`

### _prepareContext(  
&nbsp;&nbsp;options: any  
): Promise<ApplicationRenderContext & {  
&nbsp;&nbsp;&nbsp;&nbsp;canCreateEntry: boolean;  
&nbsp;&nbsp;&nbsp;&nbsp;canCreateFolder: boolean;  
&nbsp;&nbsp;&nbsp;&nbsp;documentName: string;  
&nbsp;&nbsp;&nbsp;&nbsp;folderIcon: string;  
&nbsp;&nbsp;&nbsp;&nbsp;sidebarIcon: any;  
}>  
Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._prepareContext

**Parameters:**  
- **options**: `any`

**Returns:**  
`Promise<ApplicationRenderContext & { canCreateEntry: boolean; canCreateFolder: boolean; documentName: string; folderIcon: string; sidebarIcon: any; }>`

### _preparePartContext(partId: any, context: any, options: any): Promise<any>  
Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._preparePartContext

**Parameters:**  
- **partId**: `any`  
- **context**: `any`  
- **options**: `any`

**Returns:** `Promise<any>`

### _preSyncPartState(  
&nbsp;&nbsp;partId: any,  
&nbsp;&nbsp;newElement: any,  
&nbsp;&nbsp;priorElement: any,  
&nbsp;&nbsp;state: any  
): void  
Overrides HandlebarsApplicationMixin(AbstractSidebarTab)._preSyncPartState

**Parameters:**  
- **partId**: `any`  
- **newElement**: `any`  
- **priorElement**: `any`  
- **state**: `any`

**Returns:** `void`

### _renderFrame(options: any): Promise<HTMLElement>  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._renderFrame

**Parameters:**  
- **options**: `any`

**Returns:** `Promise<HTMLElement>`

### _renderHTML(  
&nbsp;&nbsp;context: ApplicationRenderContext,  
&nbsp;&nbsp;options: HandlebarsRenderOptions  
): Promise<any>  
Render an HTMLElement for the Application. An Application subclass must implement this method in order for the Application to be renderable.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._renderHTML

**Parameters:**  
- **context**: `ApplicationRenderContext` Context data for the render operation  
- **options**: `HandlebarsRenderOptions` Options which configure application rendering behavior

**Returns:** `Promise<any>`  
The result of HTML rendering, passed to `_replaceHTML`.

### _syncPartState(  
&nbsp;&nbsp;partId: any,  
&nbsp;&nbsp;newElement: any,  
&nbsp;&nbsp;priorElement: any,  
&nbsp;&nbsp;state: any  
): void  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab)._syncPartState

**Parameters:**  
- **partId**: `any`  
- **newElement**: `any`  
- **priorElement**: `any`  
- **state**: `any`

**Returns:** `void`

### activate(): void  
Activate this tab in the sidebar.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### addEventListener(  
&nbsp;&nbsp;type: string,  
&nbsp;&nbsp;listener: EmittedEventListener,  
&nbsp;&nbsp;options?: { once?: boolean },  
): void  
Add a new event listener for a certain type of event.  
See [MDN EventTarget.addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

**Parameters:**  
- **type**: The type of event being registered for  
- **listener**: The listener function called when the event occurs  
- **options** (optional): Options which configure the event listener  
&nbsp;&nbsp;&nbsp;&nbsp;- **once?**: Should the event only be responded to once and then removed

### bringToFront(): void  
Bring this Application window to the front of the rendering stack by increasing its z-index.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### changeTab(  
&nbsp;&nbsp;tab: string,  
&nbsp;&nbsp;group: string,  
&nbsp;&nbsp;options?: { event?: Event; force?: boolean; navElement?: HTMLElement; updatePosition?: boolean },  
): void  
Change the active tab within a tab group in this Application instance.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

**Parameters:**  
- **tab**: The name of the tab which should become active  
- **group**: The name of the tab group which defines the set of tabs  
- **options** (optional): Additional options which affect tab navigation  
&nbsp;&nbsp;&nbsp;&nbsp;- **event?**: An interaction event which caused the tab change  
&nbsp;&nbsp;&nbsp;&nbsp;- **force?**: Force changing the tab even if the new tab is already active  
&nbsp;&nbsp;&nbsp;&nbsp;- **navElement?**: An explicit navigation element being modified  
&nbsp;&nbsp;&nbsp;&nbsp;- **updatePosition?**: Update application position after changing the tab?

### close(  
&nbsp;&nbsp;options?: Partial<ApplicationClosingOptions>,  
): Promise<DocumentDirectory<TDocument>>  
Close the Application, removing it from the DOM.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

**Parameters:**  
- **options** (optional): Options which modify how the application is closed.

**Returns:**  
A Promise which resolves to the closed Application instance.

### collapseAll(): void  
Collapse all open folders in this directory.

### dispatchEvent(event: Event): boolean  
Dispatch an event on this target.  
See [MDN EventTarget.dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

**Parameters:**  
- **event**: The Event to dispatch  
**Returns:** Was default behavior for the event prevented?

### maximize(): Promise<void>  
Restore the Application to its original dimensions.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### minimize(): Promise<void>  
Minimize the Application, collapsing it to a minimal header.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### removeEventListener(type: string, listener: EmittedEventListener): void  
Remove an event listener for a certain type of event.  
See [MDN EventTarget.removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### render(options: any, _options: any): Promise<DocumentDirectory<TDocument>>  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### renderPopout(): Promise<AbstractSidebarTab<ApplicationConfiguration, ApplicationRenderOptions>>  
Pop-out this sidebar tab as a new application.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition  
Update the Application element position by merging provided data with the prior position.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

**Parameters:**  
- **position** (optional): New Application positioning data  

**Returns:** The updated application position

### submit(submitOptions?: object): Promise<any>  
Programmatically submit an ApplicationV2 instance which implements a single top-level form.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

**Parameters:**  
- **submitOptions** (optional): Arbitrary options supported by the form submission handler.

**Returns:**  
A promise that resolves to the result of the form submission handler.

### toggleControls(  
&nbsp;&nbsp;expanded?: boolean,  
&nbsp;&nbsp;options?: { animate?: boolean },  
): Promise<void>  
Toggle display of the Application controls menu. Only applicable to window Applications.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

**Parameters:**  
- **expanded** (optional): Set controls visibility to a specific state or toggle current state  
- **options** (optional): Options to configure the toggling behavior  
&nbsp;&nbsp;&nbsp;&nbsp;- **animate?**: Animate the controls toggling.

---

## Protected Methods

### _attachFrameListeners(): void  
Attach event listeners to the Application frame.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _canCreateEntry(): boolean  
Determine if the current user has permission to create directory entries.

### _canCreateFolder(): boolean  
Determine if the current user has permission to create folders in this directory.

### _canDragDrop(selector: string): boolean  
Determine if drop operations are permitted.

**Parameters:**  
- **selector**: The candidate HTML selector for dragging

**Returns:** Whether the current user can drag this selector.

### _canDragStart(selector: string): boolean  
Determine if drag operations are permitted.

**Parameters:**  
- **selector**: The candidate HTML selector for dragging

**Returns:** Whether the current user can drag this selector.

### _configureRenderOptions(options: HandlebarsRenderOptions): void  
Modify the provided options passed to a render request.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _createContextMenu(  
&nbsp;&nbsp;handler: () => ContextMenuEntry[],  
&nbsp;&nbsp;selector: string,  
&nbsp;&nbsp;options?: { container?: HTMLElement; hookName?: string; parentClassHooks?: boolean },  
): null | ContextMenu  
Create a ContextMenu instance used in this Application.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _createContextMenus(): void  
Register context menu entries and fire hooks.

### _createDroppedEntry(entry: DirectoryMixinEntry, updates?: object): Promise<TDocument>  
Create a new entry in this directory from one that was dropped on it.

### _createDroppedFolderContent(  
&nbsp;&nbsp;folder: documents.Folder,  
&nbsp;&nbsp;targetFolder?: documents.Folder  
): Promise<documents.Folder[]>  
Import a dropped folder and its children into this collection if they do not already exist.

### _createDroppedFolderDocuments(  
&nbsp;&nbsp;folder: documents.Folder,  
&nbsp;&nbsp;documents: object[] | TDocument[]  
): Promise<void>  
Create a set of documents in a dropped folder.

### _entryAlreadyExists(entry: ClientDocument): boolean  
Test if the given entry is already present in this directory.

### _entryBelongsToFolder(entry: DirectoryMixinEntry, folder: string): boolean  
Determine whether a given directory entry belongs to the given folder.

### _getDroppedEntryFromData(data: object): Promise<ClientDocument>  
Get the entry instance from its dropped data. Throws if the correct instance type could not be retrieved.

### _getEntryContextOptions(): ContextMenuEntry[]  
Get context menu entries for entries in this directory.

### _getEntryDragData(entryId: string): any  
Get drag data for an entry in this directory.

### _getFolderContextOptions(): ContextMenuEntry[]  
Get context menu entries for folders in this directory.

### _getFolderDragData(folderId: string): any  
Get drag data for a folder in this directory.

### _getHeaderControls(): ApplicationHeaderControlsEntry[]  
Configure the array of header control menu options.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _getTabsConfig(group: string): null | ApplicationTabsConfiguration  
Get the configuration for a tabs group.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _handleDroppedEntry(target: HTMLElement, data: object): Promise<void>  
Handle dropping a new entry into this directory.

### _handleDroppedFolder(target: HTMLElement, data: object): Promise<void>  
Handle dropping a folder onto the directory.

### _handleDroppedForeignFolder(  
&nbsp;&nbsp;folder: documents.Folder,  
&nbsp;&nbsp;closestFolderId: string,  
&nbsp;&nbsp;sortData: object  
): Promise<null | { folder: documents.Folder; sortNeeded: boolean }>  
Handle importing a new folder into the directory.

### _headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>  
Iterate over header control buttons, filtering for controls which are visible for the current client.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _insertElement(element: HTMLElement): void  
Insert the application HTML element into the DOM.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _matchSearchEntries(  
&nbsp;&nbsp;query: RegExp,  
&nbsp;&nbsp;entryIds: Set<string>,  
&nbsp;&nbsp;folderIds: Set<string>,  
&nbsp;&nbsp;autoExpandIds: Set<string>,  
&nbsp;&nbsp;options?: object  
): void  
Identify entries in the collection which match a provided search query.

### _matchSearchFolders(  
&nbsp;&nbsp;query: RegExp,  
&nbsp;&nbsp;folderIds: Set<string>,  
&nbsp;&nbsp;autoExpandIds: Set<string>,  
&nbsp;&nbsp;options?: object  
): void  
Identify folders in the collection which match a provided search query.

### _onActivate(): void  
Actions performed when this tab is activated in the sidebar.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void  
Handle changes to an input element within the form.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _onClickAction(event: PointerEvent, target: HTMLElement): void  
A generic event handler for action clicks which can be extended by subclasses. Action handlers defined in `DEFAULT_OPTIONS` are called first. This method is only called for actions which have no defined handler.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _onClickEntry(  
&nbsp;&nbsp;event: PointerEvent,  
&nbsp;&nbsp;target: HTMLElement,  
&nbsp;&nbsp;options?: { _skipDeprecation?: boolean },  
): Promise<void>  
Handle activating a directory entry.

### _onClickTab(event: PointerEvent): void  
Handle click events on a tab within the Application.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _onCreateEntry(event: PointerEvent, target: HTMLElement): any  
Handle creating a new entry in this directory.

### _onCreateFolder(event: PointerEvent, target: HTMLElement): void  
Handle creating a new folder in this directory.

### _onDeactivate(): void  
Actions performed when this tab is deactivated in the sidebar.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _onDragHighlight(event: DragEvent): void  
Highlight folders as drop targets when a drag event enters or exits their area.

### _onDragOver(event: DragEvent): void  
Handle drag events over the directory.

### _onMatchSearchEntry(  
&nbsp;&nbsp;query: string,  
&nbsp;&nbsp;entryIds: Set<string>,  
&nbsp;&nbsp;element: HTMLElement,  
&nbsp;&nbsp;options?: object  
): void  
Handle matching a given directory entry with the search filter.

### _onPosition(position: ApplicationPosition): void  
Actions performed after the Application is re-positioned.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _onSearchFilter(  
&nbsp;&nbsp;event: KeyboardEvent,  
&nbsp;&nbsp;query: string,  
&nbsp;&nbsp;rgx: RegExp,  
&nbsp;&nbsp;html: HTMLElement  
): void  
Handle directory searching and filtering.

### _onSubmitForm(  
&nbsp;&nbsp;formConfig: ApplicationFormConfiguration,  
&nbsp;&nbsp;event: Event | SubmitEvent  
): Promise<void>  
Handle submission for an Application which uses the form element.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _onToggleFolder(  
&nbsp;&nbsp;event: PointerEvent,  
&nbsp;&nbsp;target: HTMLElement,  
&nbsp;&nbsp;options?: { _skipDeprecation?: boolean }  
): any  
Handle toggling a folder's expanded state.

### _organizeDroppedFoldersAndDocuments(  
&nbsp;&nbsp;folder: documents.Folder,  
&nbsp;&nbsp;targetFolder?: documents.Folder  
): Promise<{  
&nbsp;&nbsp;&nbsp;&nbsp;documentsToCreate: object[] | TDocument[];  
&nbsp;&nbsp;&nbsp;&nbsp;foldersToCreate: documents.Folder[];  
}>  
Organize a dropped folder and its children into a list of folders and documents to create.

### _preClose(options: HandlebarsRenderOptions): Promise<void>  
Actions performed before closing the Application. Pre-close steps are awaited by the close process.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _preFirstRender(  
&nbsp;&nbsp;context: ApplicationRenderContext,  
&nbsp;&nbsp;options: HandlebarsRenderOptions  
): Promise<void>  
Actions performed before a first render of the Application.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _prepareDirectoryContext(  
&nbsp;&nbsp;context: ApplicationRenderContext,  
&nbsp;&nbsp;options: HandlebarsRenderOptions  
): Promise<void>  
Prepare render context for the directory part.

### _prepareFooterContext(  
&nbsp;&nbsp;context: ApplicationRenderContext,  
&nbsp;&nbsp;options: HandlebarsRenderOptions  
): Promise<void>  
Prepare render context for the footer part.

### _prepareHeaderContext(  
&nbsp;&nbsp;context: ApplicationRenderContext,  
&nbsp;&nbsp;options: HandlebarsRenderOptions  
): Promise<void>  
Prepare render context for the header part.

### _prepareTabs(group: string): Record<string, ApplicationTab>  
Prepare application tab data for a single tab group.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _prePosition(position: ApplicationPosition): void  
Actions performed before the Application is re-positioned. Pre-position steps are not awaited because `setPosition` is synchronous.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _preRender(  
&nbsp;&nbsp;context: ApplicationRenderContext,  
&nbsp;&nbsp;options: HandlebarsRenderOptions  
): Promise<void>  
Actions performed before any render of the Application. Pre-render steps are awaited by the render process.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _removeElement(element: HTMLElement): void  
Remove the application HTML element from the DOM. Subclasses may override this method to customize removal.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement  
Render a header control button.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _replaceHTML(  
&nbsp;&nbsp;result: any,  
&nbsp;&nbsp;content: HTMLElement,  
&nbsp;&nbsp;options: HandlebarsRenderOptions  
): void  
Replace the HTML of the application with the result provided by the rendering backend.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _tearDown(options: ApplicationClosingOptions): void  
Remove elements from the DOM and trigger garbage collection as part of application closure.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _updateFrame(options: HandlebarsRenderOptions): void  
When the Application is rendered, optionally update aspects of the window frame.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

### _updatePosition(position: ApplicationPosition): ApplicationPosition  
Translate a requested application position update into a resolved allowed position for the Application. Subclasses may override this method to implement more advanced positioning behavior.  
Inherited from HandlebarsApplicationMixin(AbstractSidebarTab).

---

## Static Methods

### inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>  
Iterate over the inheritance chain of this Application. The chain includes this Application itself and all parents until the base application is encountered.

Yields in order from this class up through `BASE_APPLICATION`.

### parseCSSDimension(style: string, parentDimension: number): number | void  
Parse a CSS style rule into a number of pixels which apply to that dimension.

**Parameters:**  
- **style**: The CSS style rule  
- **parentDimension**: The relevant dimension of the parent element

**Returns:**  
The parsed style dimension in pixels.

### waitForImages(element: HTMLElement): Promise<void>  
Wait for any images in the given element to load.

**Parameters:**  
- **element**: The HTMLElement to wait on

**Returns:**  
A promise which resolves when all images have loaded.

---

For more information, visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/classes/foundry.applications.sidebar.DocumentDirectory.html).