# CanvasTour | Foundry Virtual Tabletop - API Documentation - Version 13

A tour for demonstrating an aspect of Canvas functionality. Automatically activates a certain canvas layer or tool depending on the needs of the step.

## Hierarchy
- [Tour](https://foundryvtt.com/api/classes/foundry.nue.Tour.html) (Base Class)
- CanvasTour

---

## Constructors

### constructor

```typescript
new CanvasTour(
    config: TourConfig,
    options?: { id?: string; namespace?: string },
): CanvasTour
```

Construct a Tour by providing a configuration.

**Parameters**

- **config**: `TourConfig`  
  The configuration of the Tour

- **options**?: `{ id?: string; namespace?: string } = {}`  
  Additional options for configuring the tour

  - **id**?: `string`  
    A tour ID that supersedes `TourConfig#id`

  - **namespace**?: `string`  
    A tour namespace that supersedes `TourConfig#namespace`

**Returns**  
`CanvasTour`

(Inherited from [Tour constructor](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#constructor))

---

## Properties

- **config**: `TourConfig`  
  Configuration of the tour. This object is cloned to avoid mutating the original configuration.  
  (Inherited from [Tour.config](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#config))

- **fadeElement**: `HTMLElement`  
  The HTMLElement that fades out the rest of the screen  
  (Inherited from [Tour.fadeElement](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#fadeelement))

- **overlayElement**: `any`  
  The HTMLElement that blocks input while a Tour is active  
  (Inherited from [Tour.overlayElement](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#overlayelement))

- **targetElement**: `HTMLElement`  
  The HTMLElement which is the focus of the current tour step.  
  (Inherited from [Tour.targetElement](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#targetelement))

- **HIGHLIGHT_PADDING**: `number` = 10 (static)  
  Padding around a Highlighted Element  
  (Inherited from [Tour.HIGHLIGHT_PADDING](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#highlight_padding))

---

## Accessors

- **canStart**: `boolean` (get)  
  Overrides `Tour.canStart`  
  Returns whether the tour can start.

- **currentStep**: `null | TourStep` (get)  
  Return the current Step, or null if the tour has not yet started.  
  (Inherited from `Tour.currentStep`)

- **description**: `string` (get)  
  The human-readable description of the tour.  
  (Inherited from `Tour.description`)

- **hasNext**: `boolean` (get)  
  Returns True if there is a next TourStep  
  (Inherited from `Tour.hasNext`)

- **hasPrevious**: `boolean` (get)  
  Returns True if there is a previous TourStep  
  (Inherited from `Tour.hasPrevious`)

- **id**: `string` (get)  
  The unique identifier of the tour.  
  (Inherited from `Tour.id`)

- **key**: `string` (get)  
  The key the Tour is stored under in `game.tours`, of the form `${namespace}.${id}`  
  (Inherited from `Tour.key`)

- **namespace**: `string` (get)  
  The package namespace for the tour.  
  (Inherited from `Tour.namespace`)

- **status**: `TourStatus` (get)  
  The current status of the Tour  
  (Inherited from `Tour.status`)

- **stepIndex**: `null | number` (get)  
  The index of the current step; -1 if the tour has not yet started, or null if the tour is finished.  
  (Inherited from `Tour.stepIndex`)

- **steps**: `TourStep[]` (get)  
  The configuration of tour steps  
  (Inherited from `Tour.steps`)

- **title**: `string` (get)  
  The human-readable title for the tour.  
  (Inherited from `Tour.title`)

- **activeTour**: `null | Tour` (static get)  
  Returns the active Tour, if any  
  (Inherited from `Tour.activeTour`)

- **tourInProgress**: `boolean` (static get)  
  Indicates if a Tour is currently in progress.  
  (Inherited from `Tour.tourInProgress`)

---

## Methods

### _preStep()

```typescript
_preStep(): Promise<void>
```

Overrides [Tour._preStep](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#_prestep)

**Returns**  
`Promise<void>`

---

### complete()

```typescript
complete(): Promise<any>
```

Advance the tour to a completed state.

(Inherited from [Tour.complete](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#complete))

**Returns**  
`Promise<any>`

---

### exit()

```typescript
exit(): void
```

Exit the tour at the current step.

(Inherited from [Tour.exit](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#exit))

**Returns**  
`void`

---

### next()

```typescript
next(): Promise<any>
```

Progress the Tour to the next step.

(Inherited from [Tour.next](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#next))

**Returns**  
`Promise<any>`

---

### previous()

```typescript
previous(): Promise<any>
```

Rewind the Tour to the previous step.

(Inherited from [Tour.previous](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#previous))

**Returns**  
`Promise<any>`

---

### progress(stepIndex: number)

```typescript
progress(stepIndex: number): Promise<any>
```

Progresses to a given Step.

**Parameters**

- **stepIndex**: `number`  
  The step to progress to

(Inherited from [Tour.progress](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#progress))

**Returns**  
`Promise<any>`

---

### reset()

```typescript
reset(): Promise<any>
```

Reset the Tour to an un-started state.

(Inherited from [Tour.reset](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#reset))

**Returns**  
`Promise<any>`

---

### start()

```typescript
start(): Promise<void>
```

Overrides [Tour.start](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#start)

**Returns**  
`Promise<void>`

---

### _getTargetElement(selector: string)

```typescript
protected _getTargetElement(selector: string): null | Element
```

Protected method.

Query the DOM for the target element using the provided selector.

**Parameters**

- **selector**: `string`  
  A CSS selector

**Returns**  
`null | Element`  
The target element, or null if not found.

(Inherited from [Tour._getTargetElement](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#_gettargetelement))

---

### _postStep()

```typescript
protected _postStep(): Promise<void>
```

Protected method.

Clean-up operations performed after a step is completed.

(Inherited from [Tour._postStep](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#_poststep))

**Returns**  
`Promise<void>`

---

### _renderStep()

```typescript
protected _renderStep(): Promise<void>
```

Protected method.

Renders the current Step of the Tour.

(Inherited from [Tour._renderStep](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#_renderstep))

**Returns**  
`Promise<void>`

---

### fromJSON(filepath: string)

```typescript
static fromJSON(filepath: string): Promise<Tour>
```

Creates and returns a Tour by loading a JSON file.

**Parameters**

- **filepath**: `string`  
  The path to the JSON file

(Inherited from [Tour.fromJSON](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#fromjson))

**Returns**  
`Promise<Tour>`

---

### onMovementAction(movementDirections: string[])

```typescript
static onMovementAction(movementDirections: string[]): true | void
```

Handle a movement action to either progress or regress the Tour.

**Parameters**

- **movementDirections**: `string[]`  
  The Directions being moved in

(Inherited from [Tour.onMovementAction](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#onmovementaction))

**Returns**  
`true | void`