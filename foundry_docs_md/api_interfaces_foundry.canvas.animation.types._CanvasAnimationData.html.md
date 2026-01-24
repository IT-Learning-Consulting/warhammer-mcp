# _CanvasAnimationData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface _CanvasAnimationData {
    attributes: CanvasAnimationAttribute[];
    fn: () => void;
    promise: Promise<boolean>;
    reject: (error: Error) => void;
    resolve: (completed: boolean) => void;
    state: number;
}
```

## Properties

- **attributes**: `CanvasAnimationAttribute[]`  
  The attributes being animated.

- **fn**: `() => void`  
  The animation function being executed each frame.

- **promise**: `Promise<boolean>`  
  A Promise which resolves once the animation is complete.

- **reject**: `(error: Error) => void`  
  The rejection function, allowing animation to be ended early.

- **resolve**: `(completed: boolean) => void`  
  The resolution function, allowing animation to be ended early.

- **state**: `number`  
  The current state of the animation (see [foundry.canvas.animation.CanvasAnimation.STATES](https://foundryvtt.com/api/classes/foundry.canvas.animation.CanvasAnimation.html#states)).

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)