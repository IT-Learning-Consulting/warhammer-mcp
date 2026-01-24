# CanvasAnimationOptions

```typescript
interface CanvasAnimationOptions {
    context?: DisplayObject;
    duration?: number;
    easing?: CanvasAnimationEasingFunction;
    name?: string | symbol;
    ontick?: (elapsedMS: number, animation: CanvasAnimationData) => void;
    priority?: number;
    time?: number;
    wait?: Promise<any>;
}
```

## Properties

### context?  
**Type:** `DisplayObject`  
A DisplayObject which defines context to the PIXI.Ticker function.

### duration?  
**Type:** `number`  
A duration in milliseconds over which the animation should occur.

### easing?  
**Type:** [CanvasAnimationEasingFunction](https://foundryvtt.com/api/types/foundry.canvas.animation.types.CanvasAnimationEasingFunction.html)  
An easing function used to translate animation time or the string name of a static member of `CanvasAnimation`.

### name?  
**Type:** `string | symbol`  
A unique name which can be used to reference the in-progress animation.

### ontick?  
**Type:** `(elapsedMS: number, animation: CanvasAnimationData) => void`  
A callback function which fires after every frame.

### priority?  
**Type:** `number`  
A priority in `PIXI.UPDATE_PRIORITY` which defines when the animation should be evaluated related to others.

### time?  
**Type:** `number`  
The current time of the animation, in milliseconds.

### wait?  
**Type:** `Promise<any>`  
The animation isn't started until this promise resolves.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)