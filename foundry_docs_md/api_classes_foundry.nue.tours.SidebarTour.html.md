# SidebarTour

A Tour subclass for the Sidebar Tour.

## Hierarchy  
[View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.nue.tours.SidebarTour)  
- _Tour_  
- **SidebarTour**

---

## Constructors

### constructor

```typescript
new SidebarTour(
    config: TourConfig, 
    options?: { id?: string; namespace?: string }
): SidebarTour
```

Construct a Tour by providing a configuration.

**Parameters:**

- **config**: _TourConfig_  
  The configuration of the Tour

- **options**?: _{ id?: string; namespace?: string }_ = {}  
  Additional options for configuring the tour

  - **id**?: _string_  
    A tour ID that supercedes TourConfig#id

  - **namespace**?: _string_  
    A tour namespace that supercedes TourConfig#namespace

**Returns:**  
_SidebarTour_

Inherited from [Tour.constructor](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#constructor)

---

## Properties

### config

**Type:** _TourConfig_  

Configuration of the tour. This object is cloned to avoid mutating the original configuration.

Inherited from [Tour.config](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#config)

### fadeElement

**Type:** _HTMLElement_  

The HTMLElement that fades out the rest of the screen

Inherited from [Tour.fadeElement](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#fadeelement)

### overlayElement

**Type:** _any_  

The HTMLElement that blocks input while a Tour is active

Inherited from [Tour.overlayElement](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#overlayelement)

### targetElement

**Type:** _HTMLElement_  

The HTMLElement which is the focus of the current tour step.

Inherited from [Tour.targetElement](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#targetelement)

---

## Accessors

### Static

#### HIGHLIGHT_PADDING

```typescript
static HIGHLIGHT_PADDING: number = 10
```

Padding around a Highlighted Element

Inherited from [Tour.HIGHLIGHT_PADDING](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#highlight_padding)

---

### canStart

```typescript
get canStart(): boolean
```

Return whether this Tour is currently eligible to be started? This is useful for tours which can only be used in certain circumstances, like if the canvas is active.

**Returns:**  
_boolean_

Inherited from [Tour.canStart](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#canstart)

---

### currentStep

```typescript
get currentStep(): null | TourStep
```

Return the current Step, or null if the tour has not yet started.

**Returns:**  
_null_ | [TourStep](https://foundryvtt.com/api/interfaces/foundry.TourStep.html)

Inherited from [Tour.currentStep](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#currentstep)

---

### description

```typescript
get description(): string
```

The human-readable description of the tour.

**Returns:**  
_string_

Inherited from [Tour.description](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#description)

---

### hasNext

```typescript
get hasNext(): boolean
```

Returns True if there is a next TourStep

**Returns:**  
_boolean_

Inherited from [Tour.hasNext](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#hasnext)

---

### hasPrevious

```typescript
get hasPrevious(): boolean
```

Returns True if there is a previous TourStep

**Returns:**  
_boolean_

Inherited from [Tour.hasPrevious](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#hasprevious)

---

### id

```typescript
get id(): string
```

The unique identifier of the tour.

**Returns:**  
_string_

Inherited from [Tour.id](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#id)

---

### key

```typescript
get key(): string
```

The key the Tour is stored under in game.tours, of the form `${namespace}.${id}`

**Returns:**  
_string_

Inherited from [Tour.key](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#key)

---

### namespace

```typescript
get namespace(): string
```

The package namespace for the tour.

**Returns:**  
_string_

Inherited from [Tour.namespace](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#namespace)

---

### status

```typescript
get status(): TourStatus
```

The current status of the Tour

**Returns:**  
[TourStatus](https://foundryvtt.com/api/types/foundry.TourStatus.html)

Inherited from [Tour.status](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#status)

---

### stepIndex

```typescript
get stepIndex(): null | number
```

The index of the current step; -1 if the tour has not yet started, or null if the tour is finished.

**Returns:**  
_null_ | _number_

Inherited from [Tour.stepIndex](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#stepindex)

---

### steps

```typescript
get steps(): TourStep[]
```

The configuration of tour steps

**Returns:**  
[TourStep](https://foundryvtt.com/api/interfaces/foundry.TourStep.html)[]

Inherited from [Tour.steps](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#steps)

---

### title

```typescript
get title(): string
```

The human-readable title for the tour.

**Returns:**  
_string_

Inherited from [Tour.title](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#title)

---

### Static

#### activeTour

```typescript
static get activeTour(): null | Tour
```

Returns the active Tour, if any

**Returns:**  
_null_ | [Tour](https://foundryvtt.com/api/classes/foundry.nue.Tour.html)

Inherited from [Tour.activeTour](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#activetour)

---

### Static

#### tourInProgress

```typescript
static get tourInProgress(): boolean
```

Indicates if a Tour is currently in progress.

**Returns:**  
_boolean_

Inherited from [Tour.tourInProgress](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#tourinprogress)

---

## Methods

### _preStep

```typescript
_preStep(): Promise<void>
```

Overrides [Tour._preStep](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#_prestep)

**Returns:**  
_Promise<void>_

---

### complete

```typescript
complete(): Promise<any>
```

Advance the tour to a completed state.

**Returns:**  
_Promise<any>_

Inherited from [Tour.complete](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#complete)

---

### exit

```typescript
exit(): void
```

Exit the tour at the current step.

**Returns:**  
_void_

Inherited from [Tour.exit](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#exit)

---

### next

```typescript
next(): Promise<any>
```

Progress the Tour to the next step.

**Returns:**  
_Promise<any>_

Inherited from [Tour.next](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#next)

---

### previous

```typescript
previous(): Promise<any>
```

Rewind the Tour to the previous step.

**Returns:**  
_Promise<any>_

Inherited from [Tour.previous](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#previous)

---

### progress

```typescript
progress(stepIndex: number): Promise<any>
```

Progresses to a given Step

**Parameters:**

- **stepIndex**: _number_  
  The step to progress to

**Returns:**  
_Promise<any>_

Inherited from [Tour.progress](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#progress)

---

### reset

```typescript
reset(): Promise<any>
```

Reset the Tour to an un-started state.

**Returns:**  
_Promise<any>_

Inherited from [Tour.reset](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#reset)

---

### start

```typescript
start(): Promise<void>
```

Overrides [Tour.start](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#start)

**Returns:**  
_Promise<void>_

---

### Protected Methods

#### _getTargetElement

```typescript
protected _getTargetElement(selector: string): null | Element
```

Query the DOM for the target element using the provided selector

**Parameters:**

- **selector**: _string_  
  A CSS selector

**Returns:**  
_null_ | _Element_

Inherited from [Tour._getTargetElement](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#_gettargetelement)

---

#### _postStep

```typescript
protected _postStep(): Promise<void>
```

Clean-up operations performed after a step is completed.

**Returns:**  
_Promise<void>_

Inherited from [Tour._postStep](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#_poststep)

---

#### _renderStep

```typescript
protected _renderStep(): Promise<void>
```

Renders the current Step of the Tour

**Returns:**  
_Promise<void>_

Inherited from [Tour._renderStep](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#_renderstep)

---

## Static Methods

### fromJSON

```typescript
static fromJSON(filepath: string): Promise<Tour>
```

Creates and returns a Tour by loading a JSON file

**Parameters:**

- **filepath**: _string_  
  The path to the JSON file

**Returns:**  
_Promise<Tour>_

Inherited from [Tour.fromJSON](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#fromjson)

---

### onMovementAction

```typescript
static onMovementAction(movementDirections: string[]): true | void
```

Handle a movement action to either progress or regress the Tour.

**Parameters:**

- **movementDirections**: _string[]_  
  The Directions being moved in

**Returns:**  
_true_ | _void_

Inherited from [Tour.onMovementAction](https://foundryvtt.com/api/classes/foundry.nue.Tour.html#onmovementaction)