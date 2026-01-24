# ImagePopout

An Image Popout Application which features a single image in a lightbox style frame. Furthermore, this application allows for sharing the display of an image with other connected players.

Belongs to the [foundry.applications.apps](https://foundryvtt.com/api/modules/foundry.applications.apps.html) namespace in Foundry Virtual Tabletop - API Documentation - Version 13.

Mixes: HandlebarsApplication

Example: Creating an Image Popout

```typescript
// Construct the Application instance
const ip = new ImagePopout({
  src: "path/to/image.jpg",
  uuid: game.actors.getName("My Hero").uuid,
  window: {title: "My Featured Image"}
});

// Display the image popout
ip.render(true);

// Share the image with other connected players
ip.shareImage();
```

---

## Hierarchy

[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.applications.apps.ImagePopout)

```
ApplicationV2<
    ApplicationConfiguration &
    ImagePopoutConfiguration,
    ApplicationRenderOptions,
    this,
>
```

---

## Constructors

### constructor

```typescript
new ImagePopout(
    options: ApplicationConfiguration & ImagePopoutConfiguration,
    _options?: {},
): ImagePopout
```

**Parameters**

- **options**: `ApplicationConfiguration & ImagePopoutConfiguration`  
  Application configuration options.

- **_options**: `{}` = `{}`  
  Optional additional options.

**Returns**  
`ImagePopout`

Overrides HandlebarsApplicationMixin(ApplicationV2).constructor

---

## Properties

### options

`Readonly<ApplicationConfiguration & ImagePopoutConfiguration>`

Application instance configuration options.

Inherited from HandlebarsApplicationMixin(ApplicationV2).options

### position

`ApplicationPosition = ...`

The current position of the application with respect to the `window.document.body`.

Inherited from HandlebarsApplicationMixin(ApplicationV2).position

### tabGroups

`Record<string, null | string> = ...`

If this Application uses tabbed navigation groups, this mapping is updated whenever the  
`changeTab` method is called. Reports the active tab for each group, with a value of `null`  
indicating no tab is active. Subclasses may override this property to define default tabs for  
each group.

Inherited from HandlebarsApplicationMixin(ApplicationV2).tabGroups

---

## Static Properties

### BASE_APPLICATION

`typeof ApplicationV2 = ApplicationV2`

Designates which upstream Application class in this class' inheritance chain is the base  
application. Any `DEFAULT_OPTIONS` of super-classes further upstream of the  
`BASE_APPLICATION` are ignored. Hook events for super-classes further upstream of the  
`BASE_APPLICATION` are not dispatched.

### DEFAULT_OPTIONS

```typescript
{
    actions: { shareImage: () => void };
    caption: string;
    classes: string[];
    uuid: null;
    window: {
        controls: {
            action: string;
            icon: string;
            label: string;
            visible: () => boolean;
        }[];
        icon: string;
        resizable: boolean;
    };
}
```

### emittedEvents

`readonly ["render", "close", "position"]`

### PARTS

`{ popout: { template: string } }`

### RENDER_STATES

`Record<string, number>`

The sequence of rendering states that describe the Application life-cycle.

### TABS

`Record<string, ApplicationTabsConfiguration> = {}`

Configuration of application tabs, with an entry per tab group.

---

## Accessors

### classList

```typescript
get classList(): DOMTokenList
```

The CSS class list of this Application instance.

Inherited from HandlebarsApplicationMixin(ApplicationV2).classList

### element

```typescript
get element(): HTMLElement
```

The HTMLElement which renders this Application into the DOM.

Inherited from HandlebarsApplicationMixin(ApplicationV2).element

### form

```typescript
get form(): null | HTMLFormElement
```

Does this Application have a top-level form element?

Inherited from HandlebarsApplicationMixin(ApplicationV2).form

### hasFrame

```typescript
get hasFrame(): boolean
```

Does this Application instance render within an outer window frame?

Inherited from HandlebarsApplicationMixin(ApplicationV2).hasFrame

### id

```typescript
get id(): string
```

The HTML element ID of this Application instance. This provides a readonly view into the  
internal ID used by this application. This getter should not be overridden by subclasses,  
which should instead configure the ID in `DEFAULT_OPTIONS` or by defining a `uniqueId` during  
_initializeApplicationOptions.

Inherited from HandlebarsApplicationMixin(ApplicationV2).id

### isVideo

```typescript
get isVideo(): boolean
```

Whether the application should display video content.

### minimized

```typescript
get minimized(): boolean
```

Is this Application instance currently minimized?

Inherited from HandlebarsApplicationMixin(ApplicationV2).minimized

### rendered

```typescript
get rendered(): boolean
```

Is this Application instance currently rendered?

Inherited from HandlebarsApplicationMixin(ApplicationV2).rendered

### state

```typescript
get state(): number
```

The current render state of the Application.

Inherited from HandlebarsApplicationMixin(ApplicationV2).state

### title

```typescript
get title(): string
```

Overrides HandlebarsApplicationMixin(ApplicationV2).title

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

Inherited from HandlebarsApplicationMixin(ApplicationV2).window

---

## Methods

### _initializeApplicationOptions

```typescript
_initializeApplicationOptions(options: any): ApplicationConfiguration
```

**Parameters**

- **options**: `any`

**Returns**: `ApplicationConfiguration`

Overrides HandlebarsApplicationMixin(ApplicationV2)._initializeApplicationOptions

### _preFirstRender

```typescript
_preFirstRender(_context: any, options: any): Promise<void>
```

**Parameters**

- **_context**: `any`
- **options**: `any`

**Returns**: `Promise<void>`

Overrides HandlebarsApplicationMixin(ApplicationV2)._preFirstRender

### _prepareContext

```typescript
_prepareContext(
    options: any,
): Promise<{
    altText: string;
    caption: undefined | string;
    image: string;
    isVideo: boolean;
    title: string;
}>
```

**Parameters**

- **options**: `any`

**Returns**: `Promise<{ altText: string; caption: undefined | string; image: string; isVideo: boolean; title: string; }>`

Overrides HandlebarsApplicationMixin(ApplicationV2)._prepareContext

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

- **context**: `ApplicationRenderContext`  
  Context data for the render operation

- **options**: `ApplicationRenderOptions`  
  Options which configure application rendering behavior

**Returns**: `Promise<any>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderHTML

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

- **type**: `string`  
  The type of event being registered for

- **listener**: `EmittedEventListener`  
  The listener function called when the event occurs

- **options?**: `{ once?: boolean } = {}`  
  Options which configure the event listener  
  - **once?**: `boolean`  
    Should the event only be responded to once and then removed

**Returns**: `void`

See [MDN - addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

Inherited from HandlebarsApplicationMixin(ApplicationV2).addEventListener

### bringToFront

```typescript
bringToFront(): void
```

Bring this Application window to the front of the rendering stack by increasing its z-index.  
Once ApplicationV1 is deprecated we should switch from _maxZ to ApplicationV2#maxZ. We  
should also eliminate `ui.activeWindow` in favor of only ApplicationV2#frontApp.

**Returns**: `void`

Inherited from HandlebarsApplicationMixin(ApplicationV2).bringToFront

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

- **tab**: `string`  
  The name of the tab which should become active

- **group**: `string`  
  The name of the tab group which defines the set of tabs

- **options?**:  
  Additional options which affect tab navigation  
  - **event?**: `Event`  
    An interaction event which caused the tab change, if any  
  - **force?**: `boolean`  
    Force changing the tab even if the new tab is already active  
  - **navElement?**: `HTMLElement`  
    An explicit navigation element being modified  
  - **updatePosition?**: `boolean`  
    Update application position after changing the tab?

**Returns**: `void`

Inherited from HandlebarsApplicationMixin(ApplicationV2).changeTab

### close

```typescript
close(options?: Partial<ApplicationClosingOptions>): Promise<ImagePopout>
```

Close the Application, removing it from the DOM.

**Parameters**

- **options?**: `Partial<ApplicationClosingOptions> = {}`  
  Options which modify how the application is closed.

**Returns**: `Promise<ImagePopout>`

Inherited from HandlebarsApplicationMixin(ApplicationV2).close

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: `Event`  
  The Event to dispatch

**Returns**: `boolean`  
Was default behavior for the event prevented?

See [MDN - dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

Inherited from HandlebarsApplicationMixin(ApplicationV2).dispatchEvent

### maximize

```typescript
maximize(): Promise<void>
```

Restore the Application to its original dimensions.

**Returns**: `Promise<void>`

Inherited from HandlebarsApplicationMixin(ApplicationV2).maximize

### minimize

```typescript
minimize(): Promise<void>
```

Minimize the Application, collapsing it to a minimal header.

**Returns**: `Promise<void>`

Inherited from HandlebarsApplicationMixin(ApplicationV2).minimize

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: `string`  
  The type of event being removed

- **listener**: `EmittedEventListener`  
  The listener function being removed

**Returns**: `void`

See [MDN - removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)

Inherited from HandlebarsApplicationMixin(ApplicationV2).removeEventListener

### render

```typescript
render(
    options?: boolean | ApplicationRenderOptions,
    _options?: ApplicationRenderOptions,
): Promise<ImagePopout>
```

Render the Application, creating its HTMLElement and replacing its innerHTML. Add it to the  
DOM if it is not currently rendered and rendering is forced. Otherwise, re-render its contents.

**Parameters**

- **options?**: `boolean | ApplicationRenderOptions = {}`  
  Options which configure application rendering behavior. A boolean is interpreted as the  
  "force" option.

- **_options?**: `ApplicationRenderOptions = {}`  
  Legacy options for backwards-compatibility with the original ApplicationV1#render signature.

**Returns**: `Promise<ImagePopout>`

Inherited from HandlebarsApplicationMixin(ApplicationV2).render

### setPosition

```typescript
setPosition(position?: Partial<ApplicationPosition>): void | ApplicationPosition
```

Update the Application element position using provided data which is merged with the prior  
position.

**Parameters**

- **position?**: `Partial<ApplicationPosition>`  
  New Application positioning data

**Returns**: `void | ApplicationPosition`  
The updated application position

Inherited from HandlebarsApplicationMixin(ApplicationV2).setPosition

### shareImage

```typescript
shareImage(options?: ShareImageConfig): void
```

Share the displayed image with other connected Users.

**Parameters**

- **options?**: `ShareImageConfig = {}`  

**Returns**: `void`

### submit

```typescript
submit(submitOptions?: object): Promise<any>
```

Programmatically submit an ApplicationV2 instance which implements a single top-level  
form.

**Parameters**

- **submitOptions?**: `object = {}`  
  Arbitrary options which are supported by and provided to the configured form submission  
  handler.

**Returns**: `Promise<any>`  
A promise that resolves to the returned result of the form submission handler, if any.

Inherited from HandlebarsApplicationMixin(ApplicationV2).submit

### toggleControls

```typescript
toggleControls(
    expanded?: boolean,
    options?: { animate?: boolean },
): Promise<void>
```

Toggle display of the Application controls menu. Only applicable to window Applications.

**Parameters**

- **expanded?**: `boolean`  
  Set the controls visibility to a specific state. Otherwise, the visible state is toggled from its  
  current value.

- **options?**: `{ animate?: boolean } = {}`  
  Options to configure the toggling behavior.  
  - **animate?**: `boolean`  
    Animate the controls toggling.

**Returns**: `Promise<void>`

Inherited from HandlebarsApplicationMixin(ApplicationV2).toggleControls

---

## Protected Methods

### _attachFrameListeners

```typescript
_attachFrameListeners(): void
```

Attach event listeners to the Application frame.

Inherited from HandlebarsApplicationMixin(ApplicationV2)._attachFrameListeners

### _canRender

```typescript
_canRender(options: ApplicationRenderOptions): false | void
```

Test whether this Application is allowed to be rendered.

**Parameters**

- **options**: `ApplicationRenderOptions`

**Returns**: `false | void`  
Return false to prevent rendering

**Throws**: An Error to display a warning message

Inherited from HandlebarsApplicationMixin(ApplicationV2)._canRender

### _configureRenderOptions

```typescript
_configureRenderOptions(options: ApplicationRenderOptions): void
```

Modify the provided options passed to a render request.

**Parameters**

- **options**: `ApplicationRenderOptions`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._configureRenderOptions

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

Create a ContextMenu instance used in this Application.

**Parameters**

- **handler**: `() => ContextMenuEntry[]`  
  A handler function that provides initial context options

- **selector**: `string`  
  A CSS selector to which the ContextMenu will be bound

- **options?**:  
  Additional options which affect ContextMenu construction  
  - **container?**: `HTMLElement`  
    A parent HTMLElement which contains the selector target  
  - **hookName?**: `string`  
    The hook name  
  - **parentClassHooks?**: `boolean`  
    Whether to call hooks for the parent classes in the inheritance chain.

**Returns**: `null | ContextMenu`  
A created ContextMenu or null if no menu items were defined

Inherited from HandlebarsApplicationMixin(ApplicationV2)._createContextMenu

### _getHeaderControls

```typescript
_getHeaderControls(): ApplicationHeaderControlsEntry[]
```

Configure the array of header control menu options.

Inherited from HandlebarsApplicationMixin(ApplicationV2)._getHeaderControls

### _getTabsConfig

```typescript
_getTabsConfig(group: string): null | ApplicationTabsConfiguration
```

Get the configuration for a tabs group.

**Parameters**

- **group**: `string`  
  The ID of a tabs group

**Returns**: `null | ApplicationTabsConfiguration`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._getTabsConfig

### _headerControlButtons

```typescript
_headerControlButtons(): Generator<ApplicationHeaderControlsEntry, any, any>
```

Iterate over header control buttons, filtering for controls which are visible for the current  
client.

**Yields**

- `ApplicationHeaderControlsEntry`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._headerControlButtons

### _insertElement

```typescript
_insertElement(element: HTMLElement): void
```

Insert the application HTML element into the DOM. Subclasses may override this method to  
customize how the application is inserted.

**Parameters**

- **element**: `HTMLElement`  
  The element to insert

Inherited from HandlebarsApplicationMixin(ApplicationV2)._insertElement

### _onChangeForm

```typescript
_onChangeForm(formConfig: ApplicationFormConfiguration, event: Event): void
```

Handle changes to an input element within the form.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound

- **event**: `Event`  
  An input change event within the form

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onChangeForm

### _onClickAction

```typescript
_onClickAction(event: PointerEvent, target: HTMLElement): void
```

A generic event handler for action clicks which can be extended by subclasses. Action  
handlers defined in DEFAULT_OPTIONS are called first. This method is only called for actions  
which have no defined handler.

**Parameters**

- **event**: `PointerEvent`  
  The originating click event

- **target**: `HTMLElement`  
  The capturing HTML element which defined a [data-action]

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClickAction

### _onClickTab

```typescript
_onClickTab(event: PointerEvent): void
```

Handle click events on a tab within the Application.

**Parameters**

- **event**: `PointerEvent`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClickTab

### _onClose

```typescript
_onClose(options: ApplicationRenderOptions): void
```

Actions performed after closing the Application. Post-close steps are not awaited by the  
close process.

**Parameters**

- **options**: `ApplicationRenderOptions`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onClose

### _onFirstRender

```typescript
_onFirstRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed after a first render of the Application.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data

- **options**: `ApplicationRenderOptions`  
  Provided render options

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onFirstRender

### _onPosition

```typescript
_onPosition(position: ApplicationPosition): void
```

Actions performed after the Application is re-positioned.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onPosition

### _onRender

```typescript
_onRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed after any render of the Application.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data

- **options**: `ApplicationRenderOptions`  
  Provided render options

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onRender

### _onSubmitForm

```typescript
_onSubmitForm(
    formConfig: ApplicationFormConfiguration,
    event: Event | SubmitEvent,
): Promise<void>
```

Handle submission for an Application which uses the form element.

**Parameters**

- **formConfig**: `ApplicationFormConfiguration`  
  The form configuration for which this handler is bound

- **event**: `Event | SubmitEvent`  
  The form submission event

Inherited from HandlebarsApplicationMixin(ApplicationV2)._onSubmitForm

### _preClose

```typescript
_preClose(options: ApplicationRenderOptions): Promise<void>
```

Actions performed before closing the Application. Pre-close steps are awaited by the close  
process.

**Parameters**

- **options**: `ApplicationRenderOptions`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._preClose

### _prepareTabs

```typescript
_prepareTabs(group: string): Record<string, ApplicationTab>
```

Prepare application tab data for a single tab group.

**Parameters**

- **group**: `string`  
  The ID of the tab group to prepare

**Returns**: `Record<string, ApplicationTab>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._prepareTabs

### _prePosition

```typescript
_prePosition(position: ApplicationPosition): void
```

Actions performed before the Application is re-positioned. Pre-position steps are not  
awaited because setPosition is synchronous.

**Parameters**

- **position**: `ApplicationPosition`  
  The requested application position

Inherited from HandlebarsApplicationMixin(ApplicationV2)._prePosition

### _preRender

```typescript
_preRender(
    context: ApplicationRenderContext,
    options: ApplicationRenderOptions,
): Promise<void>
```

Actions performed before any render of the Application. Pre-render steps are awaited by the  
render process.

**Parameters**

- **context**: `ApplicationRenderContext`  
  Prepared context data

- **options**: `ApplicationRenderOptions`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._preRender

### _removeElement

```typescript
_removeElement(element: HTMLElement): void
```

Remove the application HTML element from the DOM. Subclasses may override this method  
to customize how the application element is removed.

**Parameters**

- **element**: `HTMLElement`  
  The element to be removed

Inherited from HandlebarsApplicationMixin(ApplicationV2)._removeElement

### _renderFrame

```typescript
_renderFrame(options: ApplicationRenderOptions): Promise<HTMLElement>
```

Render the outer framing HTMLElement which wraps the inner HTML of the Application.

**Parameters**

- **options**: `ApplicationRenderOptions`

**Returns**: `Promise<HTMLElement>`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderFrame

### _renderHeaderControl

```typescript
_renderHeaderControl(control: ApplicationHeaderControlsEntry): HTMLLIElement
```

Render a header control button.

**Parameters**

- **control**: `ApplicationHeaderControlsEntry`

**Returns**: `HTMLLIElement`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._renderHeaderControl

### _replaceHTML

```typescript
_replaceHTML(
    result: any,
    content: HTMLElement,
    options: ApplicationRenderOptions,
): void
```

Replace the HTML of the application with the result provided by the rendering backend. An  
Application subclass should implement this method in order for the Application to be  
renderable.

**Parameters**

- **result**: `any`  
  The result returned by the application rendering backend

- **content**: `HTMLElement`  
  The content element into which the rendered result must be inserted

- **options**: `ApplicationRenderOptions`

**Returns**: `void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._replaceHTML

### _tearDown

```typescript
_tearDown(options: ApplicationClosingOptions): void
```

Remove elements from the DOM and trigger garbage collection as part of application  
closure.

**Parameters**

- **options**: `ApplicationClosingOptions`

**Returns**: `void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._tearDown

### _updateFrame

```typescript
_updateFrame(options: ApplicationRenderOptions): void
```

When the Application is rendered, optionally update aspects of the window frame.

**Parameters**

- **options**: `ApplicationRenderOptions`

**Returns**: `void`

Inherited from HandlebarsApplicationMixin(ApplicationV2)._updateFrame

### _updatePosition

```typescript
_updatePosition(position: ApplicationPosition): ApplicationPosition
```

Translate a requested application position updated into a resolved allowed position for the  
Application. Subclasses may override this method to implement more advanced positioning  
behavior.

**Parameters**

- **position**: `ApplicationPosition`  
  Requested Application positioning data

**Returns**: `ApplicationPosition`  
Resolved Application positioning data

Inherited from HandlebarsApplicationMixin(ApplicationV2)._updatePosition

---

## Static Methods

### inheritanceChain

```typescript
static inheritanceChain(): Generator<typeof ApplicationV2, void, unknown>
```

Iterate over the inheritance chain of this Application. The chain includes this Application itself  
and all parents until the base application is encountered.

See [ApplicationV2.BASE_APPLICATION](https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html#base_application)

**Yields**

- `typeof ApplicationV2`

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

**Returns**: `number | void`  
The parsed style dimension in pixels

### waitForImages

```typescript
static waitForImages(element: HTMLElement): Promise<void>
```

Wait for any images in the given element to load.

**Parameters**

- **element**: `HTMLElement`  
  The element.

**Returns**: `Promise<void>`