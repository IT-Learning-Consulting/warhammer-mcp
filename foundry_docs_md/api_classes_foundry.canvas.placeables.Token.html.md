# Token | Foundry Virtual Tabletop - API Documentation - Version 13

A `Token` is an implementation of `PlaceableObject` which represents a [foundry.documents.Actor within a viewed Scene on the game canvas](https://foundryvtt.com/api/classes/foundry.documents.Actor.html).

**See also:**

- [foundry.documents.TokenDocument](https://foundryvtt.com/api/classes/foundry.documents.TokenDocument.html)
- [foundry.canvas.layers.TokenLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.TokenLayer.html)

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.canvas.placeables.Token)):

- [PlaceableObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html)
- **Token**

---

## Constructors

### constructor

```typescript
new Token(document: TokenDocument): canvas.placeables.Token
```

- **Parameters:**
  - `document`: `TokenDocument`  
    The TokenDocument that this Token represents.
- **Returns:**  
  `canvas.placeables.Token`


---

## Properties

### bars

- **Type:** `Container<DisplayObject>`
- The attribute bars of this Token.

### border

- **Type:** `Graphics`
- A Graphics instance which renders the border frame for this Token inside the GridLayer.

### controlIcon

- **Type:** `null | ControlIcon`
- A control icon for interacting with the object.  
  Inherited from [PlaceableObject.controlIcon](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#controlicon).

### detectionFilter

- **Type:** `null`
- Defines the filter to use for detection.

### detectionFilterMesh

- **Type:** `DisplayObject`
- Renders the mesh with the detection filter.

### document

- **Type:** `CanvasDocument`
- A reference to the Scene embedded Document instance which this object represents.  
  Inherited from [PlaceableObject.document](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#document).

### effects

- **Type:** `Container<DisplayObject>`
- The effects icons of temporary ActiveEffects that are applied to the Actor of this Token.

### light

- **Type:** `PointLightSource`
- A reference to the LightSource object which defines this light source area of effect.  
  This is undefined if the Token does not provide an active source of light.

### mesh

- **Type:** `PrimarySpriteMesh`
- A reference to the SpriteMesh which displays this Token in the PrimaryCanvasGroup.

### mouseInteractionManager

- **Type:** `MouseInteractionManager`
- A mouse interaction manager instance which handles mouse workflows related to this object.  
  Inherited from [PlaceableObject.mouseInteractionManager](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#mouseinteractionmanager).

### nameplate

- **Type:** `PreciseText`
- The nameplate of this Token, which displays its name.

### renderFlags

- **Type:** `RenderFlags`
- Status flags which are applied at render-time to update the PlaceableObject. If an object defines RenderFlags, it should at least include flags for `"redraw"` and `"refresh"`.  
  Inherited from [PlaceableObject.renderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#renderflags).

### ruler

- **Type:** `null | BaseTokenRuler`
- The ruler of this Token.

### scene

- **Type:** `documents.Scene`
- Retain a reference to the Scene within which this Placeable Object resides.  
  Inherited from [PlaceableObject.scene](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#scene).

### shape

- **Type:** `Rectangle | Polygon | Circle`
- The shape of this token.

### targetArrows

- **Type:** `Graphics`
- The target arrows marker, which indicates that this Token is targeted by this User.

### targeted

- **Type:** `Set<documents.User>`
- Track the set of User documents which are currently targeting this Token.

### targetPips

- **Type:** `Graphics`
- The target pips marker, which indicates that this Token is targeted by other User(s).

### texture

- **Type:** `Texture<Resource>`
- The texture of this Token, which is used by its mesh.

### tooltip

- **Type:** `PreciseText`
- The tooltip text of this Token, which contains its elevation.

### turnMarker

- **Type:** `null | TokenTurnMarker`
- The Turn Marker of this Token. Only a subset of Token objects have a turn marker at any given time.

### vision

- **Type:** `PointVisionSource`
- A reference to the VisionSource object which defines this vision source area of effect.  
  This is undefined if the Token does not provide an active source of vision.

### voidMesh

- **Type:** `DisplayObject`
- Renders the mesh of this Token with ERASE blending in the Token.

### _plannedMovement (Protected)

- **Type:** `{ [userId: string]: TokenPlannedMovement } = {}`
- The ruler data.

### embeddedName (Static)

- **Type:** `string = "Token"`
- Identify the official Document name for this PlaceableObject class.  
  Overrides [PlaceableObject.embeddedName](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#embeddedname).

### RENDER_FLAG_PRIORITY (Static)

- **Type:** `string = "OBJECTS"`
- The ticker priority when RenderFlags of this class are handled. Valid values are `OBJECTS` or `PERCEPTION`.  
  Inherited from [PlaceableObject.RENDER_FLAG_PRIORITY](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flag_priority).

### RENDER_FLAGS (Static)

```ts
{
  recoverFromPreview: { deprecated: { since: number; until: number } };
  redraw: { propagate: string[] };
  redrawEffects: {};
  refresh: { alias: boolean; propagate: string[] };
  refreshBars: {};
  refreshBorder: {};
  refreshEffects: {};
  refreshElevation: { propagate: string[] };
  refreshMesh: { propagate: string[] };
  refreshNameplate: {};
  refreshPosition: {};
  refreshRingVisuals: {};
  refreshRotation: {};
  refreshRuler: {};
  refreshShader: {};
  refreshShape: { propagate: string[] };
  refreshSize: { propagate: string[] };
  refreshState: { propagate: string[] };
  refreshTarget: {};
  refreshTooltip: {};
  refreshTransform: { alias: boolean; propagate: string[] };
  refreshTurnMarker: {};
  refreshVisibility: {};
} = ...
```
- **Type declaration:**

  - `recoverFromPreview`: `{ deprecated: { since: number; until: number } }` (Deprecated since v12 Stable 4)
  - `redraw`: `{ propagate: string[] }`
  - `redrawEffects`: `{}`
  - `refresh`: `{ alias: boolean; propagate: string[] }`
  - `refreshBars`: `{}`
  - `refreshBorder`: `{}`
  - etc.  
  Overrides [PlaceableObject.RENDER_FLAGS](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#render_flags).


---

## Accessors

### _original

```typescript
get _original(): undefined | PlaceableObject
```
The object that this object is a preview of if this object is a preview.  
**Returns:** `undefined | PlaceableObject`  
Inherited from PlaceableObject._original.

### actor

```typescript
get actor(): null | documents.Actor
```
A convenient reference to the Actor object associated with the Token embedded document.  
**Returns:** `null | documents.Actor`

### animationContexts

```typescript
get animationContexts(): Map<string, TokenAnimationContext>
```
The current animations of this Token.  
**Returns:** `Map<string, TokenAnimationContext>`

### animationName

```typescript
get animationName(): string
```
The general animation name used for this Token.  
**Returns:** `string`

### bounds

```typescript
get bounds(): Rectangle
```
**Returns:** `Rectangle`  
Overrides PlaceableObject.bounds.

### brightRadius

```typescript
get brightRadius(): number
```
Translate the token's bright light distance in units into a radius in pixels.  
**Returns:** `number`

### center

```typescript
get center(): Point
```
**Returns:** `Point`  
Overrides PlaceableObject.center.

### combatant

```typescript
get combatant(): null | documents.Combatant
```
Return a reference to a Combatant that represents this Token, if one is present in the current encounter.  
**Returns:** `null | documents.Combatant`

### controlled

```typescript
get controlled(): boolean
```
An indicator for whether the object is currently controlled.  
**Returns:** `boolean`  
Inherited from PlaceableObject.controlled.

### detectionModes

```typescript
get detectionModes(): TokenDetectionMode[]
```
Return a reference to the detection modes array.  
**Returns:** `TokenDetectionMode[]`

### dimRadius

```typescript
get dimRadius(): number
```
Translate the token's dim light distance in units into a radius in pixels.  
**Returns:** `number`

### emitsDarkness

```typescript
get emitsDarkness(): boolean
```
Does this token actively emit darkness given its properties and the current darkness level of the Scene?  
**Returns:** `boolean`

### emitsLight

```typescript
get emitsLight(): boolean
```
Does this token actively emit light given its properties and the current darkness level of the Scene?  
**Returns:** `boolean`

### externalRadius

```typescript
get externalRadius(): number
```
The external radius of the token in pixels.  
**Returns:** `number`

### h

```typescript
get h(): number
```
Translate the token's grid height into a pixel height based on the canvas size.  
**Returns:** `number`

### hasActiveHUD

```typescript
get hasActiveHUD(): boolean
```
Is the HUD display active for this Placeable?  
**Returns:** `boolean`  
Inherited from PlaceableObject.hasActiveHUD.

### hasDynamicRing

```typescript
get hasDynamicRing(): boolean
```
A convenience boolean to test whether the Token is using a dynamic ring.  
**Returns:** `boolean`

### hasLimitedSourceAngle

```typescript
get hasLimitedSourceAngle(): boolean
```
Test whether the Token uses a limited angle of vision or light emission.  
**Returns:** `boolean`

### hasPreview

```typescript
get hasPreview(): boolean
```
Does there exist a temporary preview of this placeable object?  
**Returns:** `boolean`  
Inherited from PlaceableObject.hasPreview.

### hasSight

```typescript
get hasSight(): boolean
```
Test whether the Token has sight (or blindness) at any radius.  
**Returns:** `boolean`

### hover

```typescript
get hover(): boolean
```
An indicator for whether the object is currently a hover target.  
**Returns:** `boolean`  
Inherited from PlaceableObject.hover.

### id

```typescript
get id(): string
```
The id of the corresponding Document which this PlaceableObject represents.  
**Returns:** `string`  
Inherited from PlaceableObject.id.

### inCombat

```typescript
get inCombat(): boolean
```
An indicator for whether or not this token is currently involved in the active combat encounter.  
**Returns:** `boolean`

### interactionState

```typescript
get interactionState(): undefined | {
    CLICKED: number;
    DRAG: number;
    DROP: number;
    GRABBED: number;
    HOVER: number;
    NONE: number;
}
```
The mouse interaction state of this placeable.  
**Returns:** The interaction state or `undefined`.  
Inherited from PlaceableObject.interactionState.

### isDragged

```typescript
get isDragged(): boolean
```
Is this Token currently being dragged?  
**Returns:** `boolean`

### isOwner

```typescript
get isOwner(): boolean
```
A convenient reference for whether the current User has full control over the document.  
**Returns:** `boolean`  
Inherited from PlaceableObject.isOwner.

### isPreview

```typescript
get isPreview(): boolean
```
Is this placeable object a temporary preview?  
**Returns:** `boolean`  
Inherited from PlaceableObject.isPreview.

### isTargeted

```typescript
get isTargeted(): boolean
```
An indicator for whether the Token is currently targeted by the active game User.  
**Returns:** `boolean`

### isVideo

```typescript
get isVideo(): boolean
```
Does this Tile depict an animated video texture?  
**Returns:** `boolean`

### isVisible

```typescript
get isVisible(): boolean
```
Determine whether the Token is visible to the calling user's perspective. Hidden Tokens are only displayed to GM Users. Non-hidden Tokens are always visible if Token Vision is not required. Controlled tokens are always visible. All Tokens are visible to a GM user if no Token is controlled.  
**Returns:** `boolean`

### layer

```typescript
get layer(): PlaceablesLayer
```
Provide a reference to the CanvasLayer which contains this PlaceableObject.  
**Returns:** `PlaceablesLayer`  
Inherited from PlaceableObject.layer.

### lightPerceptionRange

```typescript
get lightPerceptionRange(): number
```
The range of this token's light perception in pixels.  
**Returns:** `number`

### movementAnimationName

```typescript
get movementAnimationName(): string
```
The animation name used to animate this Token's movement.  
**Returns:** `string`

### movementAnimationPromise

```typescript
get movementAnimationPromise(): null | Promise<void>
```
The promise of the current movement animation chain of this Token or null if there isn't a movement animation in progress.  
**Returns:** `null | Promise<void>`

### name

```typescript
get name(): string
```
Convenience access to the token's nameplate string.  
**Returns:** `string`

### objectId

```typescript
get objectId(): string
```
A unique identifier which is used to uniquely identify elements on the canvas related to this object.  
**Returns:** `string`  
Inherited from PlaceableObject.objectId.

### observer

```typescript
get observer(): boolean
```
A boolean flag for whether the current game User has observer permission for the Token.  
**Returns:** `boolean`

### optimalSightRange

```typescript
get optimalSightRange(): number
```
Translate the token's maximum vision range that takes into account lights.  
**Returns:** `number`

### radius

```typescript
get radius(): number
```
The maximum radius in pixels of the light field.  
**Returns:** `number`

### ring

```typescript
get ring(): null | TokenRing
```
A TokenRing instance which is used if this Token applies a dynamic ring. This property is null if the Token does not use a dynamic ring.  
**Returns:** `null | TokenRing`

### sheet

```typescript
get sheet(): DocumentSheetV2
```
A document sheet used to configure the properties of this Placeable Object or the Document it represents.  
**Returns:** `DocumentSheetV2`  
Inherited from PlaceableObject.sheet.

### showRuler

```typescript
get showRuler(): boolean
```
Should the ruler of this Token be visible?  
**Returns:** `boolean`

### sightRange

```typescript
get sightRange(): number
```
Translate the token's vision range in units into a radius in pixels.  
**Returns:** `number`

### sourceElement

```typescript
get sourceElement(): HTMLImageElement | HTMLVideoElement
```
The HTML source element for the primary Tile texture.  
**Returns:** `HTMLImageElement | HTMLVideoElement`

### sourceId

```typescript
get sourceId(): string
```
**Returns:** `string`  
Overrides PlaceableObject.sourceId.

### w

```typescript
get w(): number
```
Translate the token's grid width into a pixel width based on the canvas size.  
**Returns:** `number`

### implementation (Static)

```typescript
get implementation(): typeof PlaceableObject
```
Return a reference to the configured subclass of this base PlaceableObject type.  
Inherited from PlaceableObject.implementation.

---

## Methods

### _applyRenderFlags

```typescript
_applyRenderFlags(flags: any): void
```

- **Parameters:**
  - `flags`: `any`
- **Returns:** `void`
- Overrides [PlaceableObject._applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_applyrenderflags)

### _canConfigure

```typescript
_canConfigure(user: any, event: any): boolean
```

- **Parameters:**
  - `user`: `any`
  - `event`: `any`
- **Returns:** `boolean`
- Overrides [PlaceableObject._canConfigure](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canconfigure)

### _canControl

```typescript
_canControl(user: any, event: any): boolean
```

- **Parameters:**
  - `user`: `any`
  - `event`: `any`
- **Returns:** `boolean`
- Overrides [PlaceableObject._canControl](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_cancontrol)

### _canDrag

```typescript
_canDrag(user: any, event: any): boolean
```

- **Parameters:**
  - `user`: `any`
  - `event`: `any`
- **Returns:** `boolean`
- Overrides [PlaceableObject._canDrag](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_candrag)

### _canHover

```typescript
_canHover(user: any, event: any): boolean
```

- **Parameters:**
  - `user`: `any`
  - `event`: `any`
- **Returns:** `boolean`
- Overrides [PlaceableObject._canHover](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canhover)

### _canHUD

```typescript
_canHUD(user: any, event: any): any
```

- **Parameters:**
  - `user`: `any`
  - `event`: `any`
- **Returns:** `any`
- Overrides [PlaceableObject._canHUD](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canhud)

### _canView

```typescript
_canView(user: any, event: any): undefined | boolean
```

- **Parameters:**
  - `user`: `any`
  - `event`: `any`
- **Returns:** `undefined | boolean`
- Overrides [PlaceableObject._canView](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_canview)

### _destroy

```typescript
_destroy(options: any): void
```

- **Parameters:**
  - `options`: `any`
- **Returns:** `void`
- The inner _destroy method which may optionally be defined by each PlaceableObject subclass.  
Overrides [PlaceableObject._destroy](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_destroy)

### _draw

```typescript
_draw(options: any): Promise<void>
```

- **Parameters:**
  - `options`: `any`
- **Returns:** `Promise<void>`
- Overrides [PlaceableObject._draw](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_draw)

### _finalizeDragLeft

```typescript
_finalizeDragLeft(event: any): void
```

- **Parameters:**
  - `event`: `any`  
    The triggering mouse click event
- **Returns:** `void`
- Finalize the left-drag operation.  
Overrides [PlaceableObject._finalizeDragLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_finalizedragleft)

### _initializeDragLeft

```typescript
_initializeDragLeft(event: any): void
```

- **Parameters:**
  - `event`: `any`  
    The triggering canvas interaction event
- **Returns:** `void`
- Initialize the left-drag operation.  
Overrides [PlaceableObject._initializeDragLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_initializedragleft)

### _onClickLeft

```typescript
_onClickLeft(event: any): void
```

- **Parameters:**
  - `event`: `any`  
    The triggering canvas interaction event
- **Returns:** `void`
- Callback actions which occur on a single left-click event to assume control of the object.  
Overrides [PlaceableObject._onClickLeft](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickleft)

### _onClickLeft2

```typescript
_onClickLeft2(event: any): void
```

- **Parameters:**
  - `event`: `any`
- **Returns:** `void`
- Overrides [PlaceableObject._onClickLeft2](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickleft2)

### _onClickRight2

```typescript
_onClickRight2(event: any): void
```

- **Parameters:**
  - `event`: `any`
- **Returns:** `void`
- Overrides [PlaceableObject._onClickRight2](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onclickright2)

### _onControl

```typescript
_onControl(__namedParameters?: { pan?: boolean; releaseOthers?: boolean }): void
```

- **Parameters:**
  - `__namedParameters` (optional):  
    - `pan?`: `boolean`  
    - `releaseOthers?`: `boolean`
- **Returns:** `void`
- Additional events which trigger once control of the object is established.  
Overrides [PlaceableObject._onControl](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_oncontrol)

### _onCreate

```typescript
_onCreate(data: any, options: any, userId: any): void
```

- **Parameters:**
  - `data`: `any`
  - `options`: `any`
  - `userId`: `any`
- **Returns:** `void`
- Register pending canvas operations which should occur after a new PlaceableObject of this type is created.  
Overrides [PlaceableObject._onCreate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_oncreate)

### _onDelete

```typescript
_onDelete(options: any, userId: any): void
```

- **Parameters:**
  - `options`: `any`
  - `userId`: `any`
- **Returns:** `void`
- Define additional steps taken when an existing placeable object of this type is deleted.  
Overrides [PlaceableObject._onDelete](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondelete)

### _onDragEnd

```typescript
_onDragEnd(): void
```

- **Returns:** `void`  
Overrides [PlaceableObject._onDragEnd](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragend)

### _onDragLeftCancel

```typescript
_onDragLeftCancel(event: any): boolean | void
```

- **Parameters:**
  - `event`: `any`  
    The triggering mouse click event
- **Returns:** `boolean | void`  
  If false, the cancellation is prevented.  
Overrides [PlaceableObject._onDragLeftCancel](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftcancel)

### _onDragLeftDrop

```typescript
_onDragLeftDrop(event: any): undefined | false
```

- **Parameters:**
  - `event`: `any`  
    The triggering canvas interaction event
- **Returns:** `undefined | false`  
Overrides [PlaceableObject._onDragLeftDrop](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftdrop)

### _onDragLeftMove

```typescript
_onDragLeftMove(event: any): void
```

- **Parameters:**
  - `event`: `any`
- **Returns:** `void`  
Overrides [PlaceableObject._onDragLeftMove](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_ondragleftmove)

### _onHoverIn

```typescript
_onHoverIn(event: any, options: any): void
```

- **Parameters:**
  - `event`: `any`
  - `options`: `any`
- **Returns:** `void`  
Actions that should be taken for this Placeable Object when a mouseover event occurs. Hover events on PlaceableObject instances allow event propagation by default.  
Overrides [PlaceableObject._onHoverIn](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onhoverin)

### _onHoverOut

```typescript
_onHoverOut(event: any): void
```

- **Parameters:**
  - `event`: `any`
- **Returns:** `void`  
Actions that should be taken for this Placeable Object when a mouseout event occurs.  
Overrides [PlaceableObject._onHoverOut](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onhoverout)

### _onRelease

```typescript
_onRelease(options: any): void
```

- **Parameters:**
  - `options`: `any`  
    Options which modify the releasing workflow.
- **Returns:** `void`  
Additional events which trigger once control of the object is released.  
Overrides [PlaceableObject._onRelease](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onrelease)

### _onUpdate

```typescript
_onUpdate(changed: any, options: any, userId: any): void
```

- **Parameters:**
  - `changed`: `any`
  - `options`: `any`
  - `userId`: `any`
- **Returns:** `void`  
Define additional steps taken when an existing placeable object of this type is updated with new data.  
Overrides [PlaceableObject._onUpdate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_onupdate)

### _overlapsSelection

```typescript
_overlapsSelection(rectangle: any): boolean
```

- **Parameters:**
  - `rectangle`: `any`
- **Returns:** `boolean`  
Overrides [PlaceableObject._overlapsSelection](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_overlapsselection)

### _pasteObject

```typescript
_pasteObject(
  offset: any,
  __namedParameters?: { hidden?: boolean; snap?: boolean },
): any
```

- **Parameters:**
  - `offset`: `any`
  - `__namedParameters` (optional):  
    - `hidden?`: `boolean`  
    - `snap?`: `boolean`
- **Returns:** `any`  
Overrides [PlaceableObject._pasteObject](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_pasteobject)

### _prepareDragLeftDropUpdates

```typescript
_prepareDragLeftDropUpdates(event: any): ({ _id: string }[] | { movement: {} })[]
```

- **Parameters:**
  - `event`: `any`
- **Returns:** `( {_id: string}[] | {movement: {}} )[]`  
Overrides [PlaceableObject._prepareDragLeftDropUpdates](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_preparedragleftdropupdates)

### _propagateLeftClick

```typescript
_propagateLeftClick(event: any): boolean
```

- **Parameters:**
  - `event`: `any`
- **Returns:** `boolean`  
Overrides [PlaceableObject._propagateLeftClick](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagateleftclick)

### _updateRotation

```typescript
_updateRotation(__namedParameters?: { delta?: number; snap?: number }): number
```

- **Parameters:**
  - `__namedParameters` (optional):  
    - `delta?`: `number`  
    - `snap?`: `number`
- **Returns:** `number`  
Overrides [PlaceableObject._updateRotation](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_updaterotation)

### activateListeners

```typescript
activateListeners(): void
```

- **Returns:** `void`  
Activate interactivity for the Placeable Object.  
Inherited from [PlaceableObject.activateListeners](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#activatelisteners)

### animate

```typescript
animate(
  to: Partial<TokenAnimationData>,
  options?: TokenAnimationOptions,
): Promise<void>
```

- **Parameters:**
  - `to`: `Partial<TokenAnimationData>`  
    The animation data to animate to.
  - `options` (optional): `TokenAnimationOptions` = `{}`  
    The options that configure the animation behavior.
- **Returns:** `Promise<void>`  
  A promise which resolves once the animation has finished or stopped.

### applyRenderFlags

```typescript
applyRenderFlags(): void
```

- **Returns:** `void`  
Inherited from [PlaceableObject.applyRenderFlags](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#applyrenderflags)

### can

```typescript
can(
  user: documents.User,
  action: 
    | "update"
    | "delete"
    | "create"
    | "view"
    | "control"
    | "configure"
    | "hover"
    | "drag"
    | "HUD",
): boolean
```

- **Parameters:**
  - `user`: `documents.User`  
    The User performing the action. Must be equal to `game.user`.
  - `action`: string literal union  
    The named action being attempted.
- **Returns:** `boolean`  
Does the User have rights to perform the action?  
Inherited from [PlaceableObject.can](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#can)

### checkCollision

```typescript
checkCollision(
  destination: Point | ElevatedPoint,
  options?: {
    mode?: "any" | "closest" | "all";
    origin?: Point | ElevatedPoint;
    type?: PointSourcePolygonType;
  }
): null | boolean | PolygonVertex | PolygonVertex[]
```

- **Parameters:**
  - `destination`: `Point | ElevatedPoint`  
    The central destination point of the attempted movement. The elevation defaults to the elevation of the origin.
  - `options` (optional):
    - `mode?`: `"any" | "closest" | "all"`  
      The collision mode to test: `"any"`, `"all"`, or `"closest"`.
    - `origin?`: `Point | ElevatedPoint`  
      The origin to be used instead of the current origin. The elevation defaults to the current elevation.
    - `type?`: `PointSourcePolygonType`  
      The collision type.
- **Returns:**  
  - `null | boolean | PolygonVertex | PolygonVertex[]`  
  The collision result depends on the mode:  
  - `any`: returns a boolean for whether any collision occurred  
  - `all`: returns a sorted array of PolygonVertex instances  
  - `closest`: returns a PolygonVertex instance or null

### clear

```typescript
clear(): void
```

- **Returns:** `void`  
Overrides [PlaceableObject.clear](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clear)

### clone

```typescript
clone(): PlaceableObject
```

- Clone the placeable object, returning a new object with identical attributes. The returned object is non-interactive, and has no assigned ID. If you plan to use it permanently you should call the create method.  
- **Returns:** `PlaceableObject`  
  A new object with identical data.  
  Inherited from [PlaceableObject.clone](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#clone)

### constrainMovementPath

```typescript
constrainMovementPath(
  waypoints: TokenConstrainMovementPathWaypoint[],
  options?: TokenConstrainMovementPathOptions,
): [constrainedPath: TokenMovementWaypoint[], wasConstrained: boolean]
```

- Constrain the given movement path.  
  The result of this function must not be affected by the animation of this Token.
- **Parameters:**
  - `waypoints`: `TokenConstrainMovementPathWaypoint[]`  
    The waypoints of movement.
  - `options` (optional): `TokenConstrainMovementPathOptions = {}`  
    Additional options.
- **Returns:** `[constrainedPath: TokenMovementWaypoint[], wasConstrained: boolean]`  
  The (constrained) path of movement and a boolean that is true iff the path was constrained. If it wasn't constrained, then a copy of the path of all given waypoints with all default values filled in is returned.

### control

```typescript
control(options?: { releaseOthers?: boolean }): boolean
```

- Assume control over a PlaceableObject, flagging it as controlled and enabling downstream behaviors.
- **Parameters:**
  - `options` (optional):  
    - `releaseOthers?`: `boolean`  
      Release any other controlled objects first.
- **Returns:** `boolean`  
  A flag denoting whether control was successful.  
  Inherited from [PlaceableObject.control](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#control)

### createTerrainMovementPath

```typescript
createTerrainMovementPath(
  waypoints: TokenGetTerrainMovementPathWaypoint[],
  options?: { preview?: boolean },
): TokenTerrainMovementWaypoint[]
```

- This function adds intermediate waypoints pre/post enter and exit for a `Region` if the Region has at least one Behavior that could affect the movement, which is determined by [foundry.data.regionBehaviors.RegionBehaviorType#_getTerrainEffects](https://foundryvtt.com/api/classes/foundry.data.regionBehaviors.RegionBehaviorType.html#_getterraineffects).  
  For each segment of the movement path, the terrain data is created from all behaviors that could affect the movement of this Token with [CONFIG.Token.movement.TerrainData.resolveTerrainEffects](https://foundryvtt.com/api/classes/foundry.data.BaseTerrainData.html#resolveterraineffects).  
  This terrain data is included in the returned regionalized movement path. This terrain data may then be used in [`Token#_getMovementCostFunction`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_getMovementCostFunction) and [`Token#constrainMovementPath`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#constrainMovementPath).
- **Parameters:**
  - `waypoints`: `TokenGetTerrainMovementPathWaypoint[]`  
    The waypoints of movement.
  - `options` (optional):  
    - `preview?`: `boolean`  
      Is preview?
- **Returns:** `TokenTerrainMovementWaypoint[]`  
  The movement path with terrain data.

### destroy

```typescript
destroy(options: any): any
```

- **Parameters:**
  - `options`: `any`
- **Returns:** `any`  
Inherited from [PlaceableObject.destroy](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#destroy)

### draw

```typescript
draw(options?: object): Promise<PlaceableObject>
```

- Draw the placeable object into its parent container.
- **Parameters:**
  - `options` (optional): `object = {}`  
    Options which may modify the draw and refresh workflow.
- **Returns:** `Promise<PlaceableObject>`  
  The drawn object.  
  Inherited from [PlaceableObject.draw](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#draw)

### drawBars

```typescript
drawBars(): void
```

- Refresh the display of Token attribute bars, rendering its latest resource data. If the bar attribute is valid (has a value and max), draw the bar. Otherwise hide it.
- **Returns:** `void`

### drawEffects

```typescript
drawEffects(): Promise<PlaceableObject>
```

- Draw the effect icons for ActiveEffect documents which apply to the Token's Actor.
- **Returns:** `Promise<PlaceableObject>`

### findMovementPath

```typescript
findMovementPath(
  waypoints: TokenFindMovementPathWaypoint[],
  options?: TokenFindMovementPathOptions,
): TokenFindMovementPathJob
```

- Find a movement path through the waypoints. The path may not necessarily be one with the least cost. The path returned may be partial, i.e., it doesn't go through all waypoints but must always start with the first waypoint unless the waypoints are empty, in which case an empty path is returned.  
  The result of this function must not be affected by the animation of this Token.
- **Parameters:**
  - `waypoints`: `TokenFindMovementPathWaypoint[]`  
    The waypoints of movement.
  - `options` (optional): `TokenFindMovementPathOptions`  
    Additional options.
- **Returns:** `TokenFindMovementPathJob`  
  The job of the movement pathfinder.

### getCenterPoint

```typescript
getCenterPoint(position?: Point): Point
```

- Get the center point of the Token.
- **Parameters:**
  - `position` (optional): `Point`  
    The position in pixels.
- **Returns:** `Point`  
  The center point.

### getDispositionColor

```typescript
getDispositionColor(): number
```

- Get the Color used to represent the disposition of this Token.
- **Returns:** `number`

### getLightRadius

```typescript
getLightRadius(units: number): number
```

- A generic transformation to turn a certain number of grid units into a radius in canvas pixels.  
  This function adds additional padding to the light radius equal to the external radius of the token. This causes light to be measured from the outer token edge, rather than from the center-point.
- **Parameters:**
  - `units`: `number`  
    The radius in grid units.
- **Returns:** `number`  
  The radius in pixels.

### getMovementAdjustedPoint

```typescript
getMovementAdjustedPoint(
  point: ElevatedPoint,
  options?: { offsetX?: number; offsetY?: number },
): ElevatedPoint
```

or overload:

```typescript
getMovementAdjustedPoint(
  point: Point,
  options?: { offsetX?: number; offsetY?: number },
): Point
```

- The Token's central position, adjusted in each direction by one or zero pixels to offset it relative to walls.
- **Parameters:**
  - `point`: `ElevatedPoint` or `Point`  
    The center point (with optional elevation).
  - `options` (optional):
    - `offsetX?`: `number`  
      The x-offset.
    - `offsetY?`: `number`  
      The y-offset.
- **Returns:** `ElevatedPoint` or `Point`  
  The adjusted center point.

### getRingColors

```typescript
getRingColors(): {}
```

- Override ring colors for this particular Token instance.
- **Returns:** `{}`

### getRingEffects

```typescript
getRingEffects(): number[]
```

- Apply additional ring effects for this particular Token instance. Effects are returned as an array of integers in [TokenRing.effects](https://foundryvtt.com/api/classes/foundry.canvas.placeables.tokens.TokenRing.html#effects).
- **Returns:** `number[]`

### getShape

```typescript
getShape(): Rectangle | Polygon | Circle | Ellipse
```

- Get the shape of this Token.
- **Returns:** `Rectangle | Polygon | Circle | Ellipse`

### getSnappedPosition

```typescript
getSnappedPosition(position: any): { x: any; y: any }
```

- **Parameters:**
  - `position`: `any`
- **Returns:** `{ x: any; y: any }`
- Overrides [PlaceableObject.getSnappedPosition](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#getsnappedposition)

### initializeLightSource

```typescript
initializeLightSource(options?: { deleted?: boolean }): void
```

- Update an emitted light source associated with this Token.
- **Parameters:**
  - `options` (optional):
    - `deleted?`: `boolean`  
      Indicate that this light source has been deleted.
- **Returns:** `void`

### initializeSources

```typescript
initializeSources(options?: { deleted?: boolean }): void
```

- Update the light and vision source objects associated with this Token.
- **Parameters:**
  - `options` (optional):
    - `deleted?`: `boolean`  
      Indicate that this light and vision source has been deleted.
- **Returns:** `void`

### initializeVisionSource

```typescript
initializeVisionSource(options?: { deleted?: boolean }): void
```

- Update the VisionSource instance associated with this Token.
- **Parameters:**
  - `options` (optional):
    - `deleted?`: `boolean`  
      Indicate that this vision source has been deleted.
- **Returns:** `void`

### measureMovementPath

```typescript
measureMovementPath(
  waypoints: TokenMeasureMovementPathWaypoint[],
  options?: TokenMeasureMovementPathOptions,
): GridMeasurePathResult
```

- Measure the movement path for this Token.
- **Parameters:**
  - `waypoints`: `TokenMeasureMovementPathWaypoint[]`  
    The waypoints of movement.
  - `options` (optional): `TokenMeasureMovementPathOptions`  
    Additional options that affect cost calculations (passed to [`Token#_getMovementCostFunction`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_getMovementCostFunction))
- **Returns:** `GridMeasurePathResult`

### recalculatePlannedMovementPath

```typescript
recalculatePlannedMovementPath(): void
```

- Recalculate the planned movement path of this Token for the current User.
- **Returns:** `void`

### refresh

```typescript
refresh(options?: object): PlaceableObject
```

- Refresh all incremental render flags for the PlaceableObject. This method is no longer used by the core software but provided for backwards compatibility.
- **Parameters:**
  - `options` (optional): `object = {}`
- **Returns:** `PlaceableObject`  
  The refreshed object.  
  Inherited from [PlaceableObject.refresh](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#refresh)

### release

```typescript
release(options?: object): boolean
```

- Release control over a PlaceableObject, removing it from the controlled set.
- **Parameters:**
  - `options` (optional): `object = {}`
- **Returns:** `boolean`  
  A Boolean flag confirming the object was released.  
  Inherited from [PlaceableObject.release](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#release)

### rotate

```typescript
rotate(angle: number, snap: number): Promise<PlaceableObject>
```

- Rotate the PlaceableObject to a certain angle of facing.
- **Parameters:**
  - `angle`: `number`  
    The desired angle of rotation.
  - `snap`: `number`  
    Snap the angle of rotation to a certain target degree increment.
- **Returns:** `Promise<PlaceableObject>`  
  The rotated object.  
  Inherited from [PlaceableObject.rotate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#rotate)

### setTarget

```typescript
setTarget(targeted?: boolean, options?: { releaseOthers?: boolean }): void
```

- Set this Token as an active target for the current game User.
- **Parameters:**
  - `targeted`: `boolean = true`  
    Is the Token now targeted?
  - `options` (optional):  
    - `releaseOthers?`: `boolean`  
      Release other active targets?
- **Returns:** `void`

### stopAnimation

```typescript
stopAnimation(options?: { reset?: boolean }): void
```

- Terminate the animations of this particular Token, if exists.
- **Parameters:**
  - `options` (optional):
    - `reset?`: `boolean`  
      Reset the TokenDocument?
- **Returns:** `void`

---

### Protected Methods

These methods are intended for internal use or to be overridden by subclasses.

- `_addDragWaypoint(point: Point, options?: { snap?: boolean }): void`  
  Add ruler waypoints and update ruler paths.

- `_canCreate(user: documents.User, event?: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Does the User have permission to create the underlying Document?

- `_canDelete(user: documents.User, event?: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Does the User have permission to delete the underlying Document?

- `_canDragLeftStart(user: documents.User, event: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Does the User have permission to left-click drag this Placeable Object?

- `_canUpdate(user: documents.User, event?: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Does the User have permission to update the underlying Document?

- `_canViewMode(mode: TokenDisplayMode): boolean`  
  Helper method to determine whether a token attribute is viewable under a certain mode.

- `_changeDragElevation(delta: number, options?: { precise?: boolean }): void`  
  Change the elevation of the dragged Tokens.

- `_createInteractionManager(): MouseInteractionManager`  
  Create a standard MouseInteractionManager for the PlaceableObject.

- `_drawBar(number: number, bar: Graphics, data: Object): boolean`  
  Draw a single resource bar, given provided data.

- `_drawEffect(src: string, tint: null | ColorSource): Promise<undefined | Sprite>`  
  Draw a status effect icon.

- `_drawEffects(): Promise<void>`  
  Draw the effect icons for ActiveEffect documents which apply to the Token's Actor.

- `_drawOverlay(src: string, tint: null | number): Promise<Sprite>`  
  Draw the overlay effect icon.

- `_drawTargetArrows(reticule?: ReticuleOptions): void`  
  Draw the targeting arrows around this token.

- `_drawTargetPips(): void`  
  Draw the targeting pips around this token.

- `_finalizeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Finalize the right-drag operation.

- `_getAnimationData(): TokenAnimationData`  
  Get the animation data for the current state of the document.

- `_getAnimationDuration(from: DeepReadonly<TokenAnimationData>, to: DeepReadonly<Partial<TokenAnimationData>>, options: TokenAnimationOptions): number`  
  Get the duration of the animation.

- `_getAnimationMovementSpeed(options: TokenAnimationOptions): number`  
  Get the base movement speed for the animation in grid size per second.

- `_getAnimationRotationSpeed(options: TokenAnimationOptions): number`  
  Get the rotation speed for the animation in 60 degrees per second. Returns the movement speed by default.

- `_getAnimationTransition(options: TokenAnimationOptions): TokenAnimationTransition`  
  Get the texture transition type. Returns `"fade"` by default.

- `_getBorderColor(): number`  
  Get the hex color that should be used to render the Token border.

- `_getDragConstrainOptions(): Omit<TokenConstrainMovementPathOptions, "history" | "preview">`  
  Get the constrain options used during the drag operation.

- `_getDragMovementAction(): string`  
  Get the movement action for the waypoints placed during a drag operation.

- `_getDragPathfindingOptions(): TokenFindMovementPathOptions`  
  Get the search options used during the drag operation to find the path of movement through the waypoints.

- `_getHUDMovementAction(): string`  
  Get the movement action in `CONFIG.Token.movement.actions` to be used for movement via the Token HUD.

- `_getKeyboardMovementAction(): string`  
  Get the movement action in `CONFIG.Token.movement.actions` to be used for keyboard movement.

- `_getLightSourceData(): LightSourceData`  
  Get the light source data.

- `_getMovementCostFunction(options?: TokenMeasureMovementPathOptions): void | TokenMovementCostFunction`  
  Create the movement cost function for this Token. In square and hexagonal grids it calculates the cost for single grid space move between two grid space offsets...

- `_getTargetAlpha(): number`  
  Get the target opacity that should be used for a Placeable Object depending on its preview state.

- `_getTextStyle(): string`  
  Get the text style that should be used for this Token's tooltip.

- `_getTooltipText(): string`  
  Return the text which should be displayed in a token's tooltip field.

- `_getVisionBlindedStates(): Record<string, boolean>`  
  Returns a record of blinding state.

- `_getVisionSourceData(): VisionSourceData`  
  Get the vision source data.

- `_initializeDragRight(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Initialize the right-drag operation.

- `_initializeRuler(): null | BaseTokenRuler`  
  Create the BaseTokenRuler instance for this Token, if any.

- `_isLightSource(): boolean`  
  Does this Token actively emit light given its properties and the current darkness level of the Scene?

- `_isVisionSource(): boolean`  
  Test whether this Token is a viable vision source for the current User.

- `_modifyAnimationMovementSpeed(speed: number, options: TokenAnimationOptions): number`  
  Modify the base movement speed of the animation. Divides by the terrain difficulty, if present, by default.

- `_onAnimationUpdate(changed: Partial<TokenAnimationData>, context: TokenAnimationContext): void`  
  Called each animation frame.

- `_onApplyStatusEffect(statusId: string, active: boolean): void`  
  Handle changes to Token behavior when a significant status effect is applied.

- `_onClickRight(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Callback actions which occur on a single right-click event to configure properties of the object.

- `_onDragClickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Called while this Token is in a drag workflow.

- `_onDragClickLeft2(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Called while this Token is in a drag workflow.

- `_onDragClickRight(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Called while this Token is in a drag workflow.

- `_onDragClickRight2(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Called while this Token is in a drag workflow.

- `_onDragLeftStart(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void`  
  Callback actions which occur when a mouse-drag action is first begun.

- `_onDragMouseWheel(event: WheelEvent): void`  
  Change the elevation of Token during dragging.

- `_onDragRightCancel(event: FederatedEvent<UIEvent | PixiTouch>): boolean | void`  
  Callback actions which occur on a right mouse-drag operation.

- `_onDragRightDrop(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Callback actions which occur on a right mouse-drag operation.

- `_onDragRightMove(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Callback actions which occur on a right mouse-drag operation.

- `_onDragRightStart(event: FederatedEvent<UIEvent | PixiTouch>): false | void`  
  Callback actions which occur on a right mouse-drag operation.

- `_onDragStart(): void`  
  Begin a drag operation from the perspective of the preview clone. Modify the appearance of both the clone (this) and the original (_original) object.

- `_onLongPress(event: FederatedEvent<UIEvent | PixiTouch>, origin: Point): any`  
  Callback action which occurs on a long press.

- `_onUnclickLeft(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Callback actions which occur on a single left-unclick event to assume control of the object.

- `_onUnclickRight(event: FederatedEvent<UIEvent | PixiTouch>): void`  
  Callback actions which occur on a single right-unclick event.

- `_prepareAnimation(
    from: DeepReadonly<TokenAnimationData>,
    changes: Partial<TokenAnimationData>,
    context: Omit<TokenAnimationContext, "promise">,
    options: TokenAnimationOptions,
  ): CanvasAnimationAttribute[]`  
  Prepare the animation data changes: performs special handling required for animating rotation.

- `_propagateRightClick(event: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Should the placeable propagate right click downstream?  
  Inherited from [PlaceableObject._propagateRightClick](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#_propagaterightclick)

- `_refreshBorder(): void`  
  Refresh the border.

- `_refreshEffects(): void`  
  Refresh the display of status effects, adjusting their position for the token width and height.

- `_refreshElevation(): void`  
  Refresh the elevation.

- `_refreshMesh(): void`  
  Refresh the token mesh.

- `_refreshMeshSizeAndScale(): void`  
  Resize mesh and handle scale adjustment.

- `_refreshNameplate(): void`  
  Refresh the text content, position, and visibility of the Token nameplate.

- `_refreshPosition(): void`  
  Refresh the position.

- `_refreshRingVisuals(): void`  
  Refresh the token ring visuals if necessary.

- `_refreshRotation(): void`  
  Refresh the rotation.

- `_refreshRuler(): void`  
  Refresh the display of the ruler.

- `_refreshShader(): void`  
  Refresh the token mesh shader.

- `_refreshShape(): void`  
  Refresh the shape.

- `_refreshSize(): void`  
  Refresh the size.

- `_refreshState(): void`  
  Refresh aspects of the user interaction state. For example the border, nameplate, or bars may be shown on Hover or on Control.

- `_refreshTarget(): void`  
  Refresh the target indicators for the Token. Draw both target arrows for the primary User and indicator pips for other Users targeting the same Token.

- `_refreshTooltip(): void`  
  Refresh the tooltip.

- `_refreshTurnMarker(): void`  
  Refresh presentation of the Token's combat turn marker, if any.

- `_refreshVisibility(): void`  
  Refresh the visibility.

- `_removeDragWaypoint(): void`  
  Remove last ruler waypoints and update ruler paths.

- `_renderDetectionFilter(renderer: Renderer): void`  
  Render the bound mesh detection filter. Note: this method does not verify that the detection filter exists.

- `_requiresRotationAnimation(): boolean`  
  Does this Token require rotation changes to be animated? If false is returned, the rotation speed is set to infinity.

- `_shouldPreventDragLeftDrop(event: FederatedEvent<UIEvent | PixiTouch>): boolean`  
  Prevent the drop event? Called by `Token#_onDragLeftDrop.`

- `_triggerDragLeftCancel(): void`  
  Cancel the drag workflow. This cancellation cannot be prevented by `Token#_onDragLeftCancel.`

- `_triggerDragLeftDrop(): void`  
  Trigger drop event. This drop cannot be prevented by `Token#_shouldPreventDragLeftDrop.`

- `_updateDragDestination(point: Point, options?: { snap?: boolean }): void`  
  Update the destinations of the drag previews and rulers.

### #onDragRightStart

```typescript
"#onDragRightStart"(event: FederatedEvent<UIEvent | PixiTouch>): false | void
```

- Callback actions which occur on a right mouse-drag operation.
- **Parameters:**
  - `event`: FederatedEvent<UIEvent | PixiTouch>  
    The triggering mouse click event
- **Returns:** `false | void`  
  If false, the start if prevented.  
  Inherited from [PlaceableObject.#onDragRightStart](https://foundryvtt.com/api/classes/foundry.canvas.placeables.PlaceableObject.html#ondragrightstart)

---

*This documentation was generated from the HTML API documentation provided by Foundry Virtual Tabletop, version 13.*