# EventEmitter | Foundry Virtual Tabletop - API Documentation - Version 13

A mixin class which implements the behavior of EventTarget. This is useful in cases where a class wants EventTarget-like behavior but needs to extend some other class.

**See**  
[https://developer.mozilla.org/en-US/docs/Web/API/EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)

## Type Parameters

- **TBaseClass**

## Hierarchy ([View Summary](https://foundryvtt.com/api/hierarchy.html#foundry.EventEmitter), Expand)

- *BaseClass*  
- **EventEmitter**  
- *ApplicationV2*  
- *Sound*  
- *FogManager*  

---

## Properties

### Static

#### emittedEvents

```typescript
emittedEvents: string[] = []
```

An array of event types which are valid for this class.

---

## Methods

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

- **listener**: [*EmittedEventListener*](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function called when the event occurs

- **options** (optional):  
  - **once?**: *boolean*  
    Should the event only be responded to once and then removed

**Returns**: *void*

**See**  
[https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener)

---

### dispatchEvent

```typescript
dispatchEvent(event: Event): boolean
```

Dispatch an event on this target.

**Parameters**

- **event**: *Event*  
  The Event to dispatch

**Returns**: *boolean*  
Was default behavior for the event prevented?

**See**  
[https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/dispatchEvent)

---

### removeEventListener

```typescript
removeEventListener(type: string, listener: EmittedEventListener): void
```

Remove an event listener for a certain type of event.

**Parameters**

- **type**: *string*  
  The type of event being removed

- **listener**: [*EmittedEventListener*](https://foundryvtt.com/api/types/foundry.utils.types.EmittedEventListener.html)  
  The listener function being removed

**Returns**: *void*

**See**  
[https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/removeEventListener)