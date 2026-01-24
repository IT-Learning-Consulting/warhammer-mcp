# FontConfig

A V2 application responsible for configuring custom fonts for the world.

---

## Hierarchy
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.settings.menus.FontConfig)

`ApplicationV2<ApplicationConfiguration, ApplicationRenderOptions, this>`

---

## Constructors

### constructor

```typescript
new FontConfig(options?: any): FontConfig
```

**Parameters**

- **options**: *any* = {}  
  App config

**Returns**  
*FontConfig*

Overrides HandlebarsApplicationMixin(ApplicationV2).constructor

---

## Properties

### object

*object: [NewFontDefinition](https://foundryvtt.com/api/interfaces/foundry.NewFontDefinition.html)*  
The new or in-progress font object we're editing.

### options

*options: Readonly<ApplicationConfiguration>*  
Application instance configuration options.

Inherited from HandlebarsApplicationMixin(ApplicationV2).options

### position

*position: ApplicationPosition = ...*  
The current position of the application with respect to the window.document.body.

Inherited from HandlebarsApplicationMixin(ApplicationV2).position

### tabGroups

*tabGroups: Record<string, null | string> = ...*  
If this Application uses tabbed navigation groups, this mapping is updated whenever the  
changeTab method is called. Reports the active tab for each group, with a value of null  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.

Inherited from HandlebarsApplicationMixin(ApplicationV2).tabGroups

### DEFAULT_OPTIONS

```typescript
{
    form: { closeOnSubmit: boolean };
    id: string;
    position: { width: number };
    tag: string;
    window: { contentClasses: string[]; icon: string; title: string };
}
```

### FONT_TYPES

*FONT_TYPES: FontTypes = ...*  
Font types.

### PARTS

```typescript
{
    body: { scrollable: string[]; template: string };
    footer: { template: string };
} = ...
```

### SETTING

*SETTING: string = "fonts"*  
The Foundry game setting key storing the world's fonts.

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance

Returns  
*DOMTokenList*

Inherited from HandlebarsApplicationMixin(ApplicationV2).classList

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

Returns  
*HTMLElement*

Inherited from HandlebarsApplicationMixin(ApplicationV2).element

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

Returns  
*null* | *HTMLFormElement*

Inherited from HandlebarsApplicationMixin(ApplicationV2).form

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

Returns  
*boolean*

Inherited from HandlebarsApplicationMixin(ApplicationV2).hasFrame

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in DEFAULT_OPTIONS or by defining a uniqueId during  
_initializeApplicationOptions.

Returns  
*string*

Inherited from HandlebarsApplicationMixin(ApplicationV2).id

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

Returns  
*boolean*

Inherited from HandlebarsApplicationMixin(ApplicationV2).minimized

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

Returns  
*boolean*

Inherited from HandlebarsApplicationMixin(ApplicationV2).rendered

### state

```typescript
get state(): number
```

The current render state of the Application.

Returns  
*number*

Inherited from HandlebarsApplicationMixin(ApplicationV2).state

### title

```typescript
get title(): string
```

A convenience reference to the title of the Application window.

Returns  
*string*

Inherited from HandlebarsApplicationMixin(ApplicationV2).title

### window

```typescript
get window(): {
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

Returns an object with the above properties.

Inherited from HandlebarsApplicationMixin(ApplicationV2).window

---

## Methods

### _onChangeForm

```typescript
_onChangeForm(formConfig: any, event: any): void
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._onChangeForm

**Parameters**

- **formConfig**: *any*
- **event**: *any*

Returns  
*void*

---

### _onClickAction

```typescript
_onClickAction(event: any, htmlElement: any): void | Promise<void>
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._onClickAction

**Parameters**

- **event**: *any*
- **htmlElement**: *any*

Returns  
*void* | *Promise<void>*

---

### _onRender

```typescript
_onRender(context: any, options: any): Promise<void>
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._onRender

**Parameters**

- **context**: *any*
- **options**: *any*

Returns  
*Promise<void>*

---

### _prepareContext

```typescript
_prepareContext(
    _options: any,
): Promise<{
    buttons: { action: string; icon: string; label: string; type: string }[];
    font: NewFontDefinition;
    fonts: { family: string; font: string; index: number; selected: boolean }[];
    fontStyles: { label: string; value: string }[];
    fontWeights: { label: string; value: number }[];
    isFileFont: boolean;
    isSystemFont: boolean;
    preview: {
        family: any;
        style: any;
        text: undefined | string;
        weight: any;
    };
    selected: any;
}>
```

Overrides HandlebarsApplicationMixin(ApplicationV2)._prepareContext

**Parameters**

- **_options**: *any*

Returns  
*Promise* containing an object with font configuration data.

---

### _renderHTML

```typescript
_abstract _renderHTML(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<any>
```

Render an HTMLElement for the Application. An Application subclass must implement this  
method in order for the Application to be renderable.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
  Context data for the render operation
- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Options which configure application rendering behavior

Returns  
*Promise<any>*  
The result of HTML rendering may be implementation specific. Whatever value is returned  
here is passed to _replaceHTML

Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderHTML

---

### addEventListener

```typescript
addEventListener(
    type: string,
    listener: EmittedEventListener,
    options?: { once?: boolean },
): void
```

Add a new event listener for a certain type of event.

**Parameters**

- **type**: *string*  
  The type of event being registered for
- **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function called when the event occurs
- **options?**:  
  - **once?**: *boolean* - Should the event only be responded to once and then removed

Returns  
*void*

See [MDN addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from HandlebarsApplicationMixin(ApplicationV2).addEventListener

---

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ We  
should also eliminate ui.activeWindow in favor of only ApplicationV2#frontApp

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2).bringToFront

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
    },
): void
```

Change the active tab within a tab group in this Application instance.

**Parameters**

- **tab**: *string*  
  The name of the tab which should become active
- **group**: *string*  
  The name of the tab group which defines the set of tabs
- **options?**:  
  - **event?**: *Event* - An interaction event which caused the tab change, if any  
  - **force?**: *boolean* - Force changing the tab even if the new tab is already active  
  - **navElement?**: *HTMLElement* - An explicit navigation element being modified  
  - **updatePosition?**: *boolean* - Update application position after changing the tab?

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2).changeTab

---

### close

```typescript
close(options?: {}): Promise<FontConfig>
```

Overrides HandlebarsApplicationMixin(ApplicationV2).close

**Parameters**

- **options**: *{}* = {}

Returns  
*Promise<FontConfig>*

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: *Event* The Event to dispatch

Returns  
*boolean* Was default behavior for the event prevented?

See [MDN dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from HandlebarsApplicationMixin(ApplicationV2).dispatchEvent

---

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

Returns  
*Promise<void>*

Inherited from HandlebarsApplicationMixin(ApplicationV2).maximize

---

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

Returns  
*Promise<void>*

Inherited from HandlebarsApplicationMixin(ApplicationV2).minimize

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: *string* The type of event being removed
- **listener**: [EmittedEventListener](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html) The listener function being removed

Returns  
*void*

See [MDN removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from HandlebarsApplicationMixin(ApplicationV2).removeEventListener

---

### render

```typescript
render(
    options?: boolean | ApplicationRenderOptions,
    _options?: ApplicationRenderOptions,
): Promise<FontConfig>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options?**: *boolean* | [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html) = {}  
  Options which configure application rendering behavior. A boolean is interpreted as the  
  "force" option.
- **_options?**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html) = {}  
  Legacy options for backwards-compatibility with the original ApplicationV1#render  
  signature.

Returns  
*Promise<FontConfig>* A Promise which resolves to the rendered Application instance

Inherited from HandlebarsApplicationMixin(ApplicationV2).render

---

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.

**Parameters**

- **position?**: *Partial<ApplicationPosition>*  
  New Application positioning data

Returns  
*void* | *ApplicationPosition* The updated application position

Inherited from HandlebarsApplicationMixin(ApplicationV2).setPosition

---

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level  
form.

**Parameters**

- **submitOptions?**: *object* = {}  
  Arbitrary options which are supported by and provided to the configured form submission  
  handler.

Returns  
*Promise<any>* A promise that resolves to the returned result of the form submission handler, if any.

Inherited from HandlebarsApplicationMixin(ApplicationV2).submit

---

### toggleControls

```typescript
toggleControls(
    expanded?: boolean,
    options?: { animate?: boolean },
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

**Parameters**

- **expanded?**: *boolean*  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
  current value
- **options?**: *{ animate?: boolean }* = {}  
  Options to configure the toggling behavior.

Returns  
*Promise<void>* A Promise which resolves once the control expansion animation is complete

Inherited from HandlebarsApplicationMixin(ApplicationV2).toggleControls

---

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Protected

Attach event listeners to the Application frame.

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._attachFrameListeners

---

### _canRender

```typescript
_canRender(options: ApplicationRenderOptions): false | void
```

Protected

Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Provided render options

Returns  
*false* | *void*  
Return false to prevent rendering

Throws  
An Error to display a warning message

Inherited from HandlebarsApplicationMixin(ApplicationV2)._canRender

---

### _configureRenderOptions

```typescript
_configureRenderOptions(options: ApplicationRenderOptions): void
```

Protected

Modify the provided options passed to a render request.

**Parameters**

- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Options which configure application rendering behavior

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._configureRenderOptions

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
    },
): null | ContextMenu
```

Protected

Create a ContextMenu instance used in this Application.

**Parameters**

- **handler**: () => ContextMenuEntry[]  
  A handler function that provides initial context options
- **selector**: *string*  
  A CSS selector to which the ContextMenu will be bound
- **options?**:  
  - **container?**: *HTMLElement* - A parent HTMLElement which contains the selector target  
  - **hookName?**: *string* - The hook name  
  - **parentClassHooks?**: *boolean* - Whether to call hooks for the parent classes in the inheritance chain.

Returns  
*null* | [ContextMenu](https://foundryvtt.com/api/classes/foundry.applications.ux.ContextMenu.html)  
A created ContextMenu or null if no menu items were defined

Inherited from HandlebarsApplicationMixin(ApplicationV2)._createContextMenu

---

### _getDataForDefinition

```typescript
_getDataForDefinition(
    family: string,
    definition: FontFamilyDefinition,
): { family: string; font: string; index: number; selected: boolean }[]
```

Protected

Build an array of font data objects for a specific font family definition.

**Parameters**

- **family**: *string*  
  The name of the font family.
- **definition**: [FontFamilyDefinition](https://foundryvtt.com/api/interfaces/CONFIG.FontFamilyDefinition.html)  
  The font family definition, expected to have a fonts array.

Returns  
Array of font data objects.

---

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Protected

Configure the array of header control menu options

Returns  
*ApplicationHeaderControlsEntry[]*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._getHeaderControls

---

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Protected

Get the configuration for a tabs group.

**Parameters**

- **group**: *string*  
  The ID of a tabs group

Returns  
*null* | *ApplicationTabsConfiguration*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._getTabsConfig

---

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Protected

Iterate over header control buttons, filtering for controls which are visible for the current  
client.

Returns  
*Generator<ApplicationHeaderControlsEntry, any, any>*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._headerControlButtons

---

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(
    options: Partial<ApplicationConfiguration>,
): ApplicationConfiguration
```

Protected

Initialize configuration options for the Application instance. The default behavior of this  
method is to intelligently merge options for each class with those of their parents.

- Array-based options are concatenated  
- Inner objects are merged  
- Otherwise, properties in the subclass replace those defined by a parent

**Parameters**

- **options**: *Partial<ApplicationConfiguration>*  
  Options provided directly to the constructor

Returns  
*ApplicationConfiguration* Configured options for the application instance

Inherited from HandlebarsApplicationMixin(ApplicationV2)._initializeApplicationOptions

---

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Protected

Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.

**Parameters**

- **element**: *HTMLElement*  
  The element to insert

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._insertElement

---

### _onAddFont

```typescript
_onAddFont(): Promise<void>
```

Protected

Add a new font definition.

Returns  
*Promise<void>*

---

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Protected

Handle click events on a tab within the Application.

**Parameters**

- **event**: *PointerEvent*

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClickTab

---

### _onClose

```typescript
_onClose(options: ApplicationRenderOptions): void
```

Protected

Actions performed after closing the Application. Post-close steps are not awaited by the  
close process.

**Parameters**

- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Provided render options

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClose

---

### _onDeleteFont

```typescript
_onDeleteFont(event: PointerEvent): Promise<void>
```

Protected

Delete a font from definitions.

**Parameters**

- **event**: *PointerEvent*

Returns  
*Promise<void>*

---

### _onFirstRender

```typescript
_onFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Protected

Actions performed after a first render of the Application.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
  Prepared context data
- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Provided render options

Returns  
*Promise<void>*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onFirstRender

---

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Protected

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)  
  The requested application position

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onPosition

---

### _onSelectFont

```typescript
_onSelectFont(event: PointerEvent): void
```

Protected

Select a font to preview/edit.

**Parameters**

- **event**: *PointerEvent*

Returns  
*void*

---

### _onSubmitForm

```typescript
_onSubmitForm(
    formConfig: ApplicationFormConfiguration,
    event: Event | SubmitEvent,
): Promise<void>
```

Protected

Handle submission for an Application which uses the form element.

**Parameters**

- **formConfig**: *ApplicationFormConfiguration* The form configuration for which this handler is bound  
- **event**: *Event | SubmitEvent* The form submission event

Returns  
*Promise<void>*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onSubmitForm

---

### _preClose

```typescript
_preClose(options: ApplicationRenderOptions): Promise<void>
```

Protected

Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.

**Parameters**

- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Provided render options

Returns  
*Promise<void>*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._preClose

---

### _preFirstRender

```typescript
_preFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Protected

Actions performed before a first render of the Application.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
  Prepared context data
- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Provided render options

Returns  
*Promise<void>*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._preFirstRender

---

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Protected

Prepare application tab data for a single tab group.

**Parameters**

- **group**: *string*  
  The ID of the tab group to prepare

Returns  
*Record<string, ApplicationTab>*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._prepareTabs

---

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Protected

Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because setPosition is synchronous.

**Parameters**

- **position**: [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)  
  The requested application position

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._prePosition

---

### _preRender

```typescript
_preRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Protected

Actions performed before any render of the Application. Pre-render steps are awaited by the  
render process.

**Parameters**

- **context**: [ApplicationRenderContext](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderContext.html)  
  Prepared context data
- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Provided render options

Returns  
*Promise<void>*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._preRender

---

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Protected

Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

**Parameters**

- **element**: *HTMLElement* The element to be removed

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._removeElement

---

### _renderFrame

```typescript
_renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>
```

Protected

Render the outer framing HTMLElement which wraps the inner HTML of the Application.

**Parameters**

- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Options which configure application rendering behavior

Returns  
*Promise<HTMLElement>*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderFrame

---

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Protected

Render a header control button.

**Parameters**

- **control**: [ApplicationHeaderControlsEntry](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationHeaderControlsEntry.html)

Returns  
*HTMLLIElement*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderHeaderControl

---

### _replaceHTML

```typescript
_replaceHTML(
    result: any,
    content: HTMLElement,
    options: ApplicationRenderOptions,
): void
```

Protected

Replace the HTML of the application with the result provided by the rendering backend. An  
Application subclass should implement this method in order for the Application to be  
renderable.

**Parameters**

- **result**: *any* The result returned by the application rendering backend  
- **content**: *HTMLElement* The content element into which the rendered result must be inserted  
- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Options which configure application rendering behavior

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._replaceHTML

---

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Protected

Remove elements from the DOM and trigger garbage collection as part of application  
closure.

**Parameters**

- **options**: [ApplicationClosingOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationClosingOptions.html)

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._tearDown

---

### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions): void
```

Protected

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: [ApplicationRenderOptions](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationRenderOptions.html)  
  Options provided at render-time

Returns  
*void*

Inherited from HandlebarsApplicationMixin(ApplicationV2)._updateFrame

---

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Protected

Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.

**Parameters**

- **position**: [ApplicationPosition](https://foundryvtt.com/api/interfaces/foundry.applications.types.ApplicationPosition.html)  
  Requested Application positioning data

Returns  
*ApplicationPosition* Resolved Application positioning data

Inherited from HandlebarsApplicationMixin(ApplicationV2)._updatePosition

---

## Static Methods

### getAvailableFontChoices

```typescript
static getAvailableFontChoices(): Record<string, string>
```

Returns a record of loaded font families, formatted for selectOptions.

Returns  
*Record<string, string>*

---

### getAvailableFonts

```typescript
static getAvailableFonts(): string[]
```

Returns a list of loaded font families.

Returns  
*string[]*

---

### loadFont

```typescript
static loadFont(family: string, definition: FontFamilyDefinition): Promise<boolean>
```

Load a font definition for a given family.

**Parameters**

- **family**: *string*  
  The font family name (case-sensitive).
- **definition**: [FontFamilyDefinition](https://foundryvtt.com/api/interfaces/CONFIG.FontFamilyDefinition.html)  
  The font family definition.

Returns  
*Promise<boolean>*  
Returns true if the font was successfully loaded.

---

### _collectDefinitions

```typescript
protected static _collectDefinitions(): Record<string, FontFamilyDefinition[]>
```

Protected

Collect font definitions from both config and user settings.

Returns  
*Record<string, FontFamilyDefinition[]>*

---

### _createFontFace

```typescript
protected static _createFontFace(family: string, definition: FontDefinition): FontFace
```

Protected

Create a FontFace from a definition.

**Parameters**

- **family**: *string*  
  The font family name.
- **definition**: [FontDefinition](https://foundryvtt.com/api/types/CONFIG.FontDefinition.html)  
  The font definition.

Returns  
*FontFace* The new FontFace.

---

### _formatFont

```typescript
protected static _formatFont(family: string, definition: FontDefinition): string
```

Protected

Format a font definition for display.

**Parameters**

- **family**: *string*  
  The font family name.
- **definition**: [FontDefinition](https://foundryvtt.com/api/types/CONFIG.FontDefinition.html)  
  The font definition.

Returns  
*string* The formatted definition.