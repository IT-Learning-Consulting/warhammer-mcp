# TokenAnimationOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TokenAnimationOptions {
    action?: string;
    chain?: boolean;
    duration?: number;
    easing?: CanvasAnimationEasingFunction;
    movementSpeed?: number;
    name?: null | string | symbol;
    ontick?: (
        elapsedMS: number,
        animation: CanvasAnimationData,
        data: TokenAnimationData,
    ) => void;
    terrain?: null | DataModel<object, DataModelConstructionContext>;
    transition?: TokenAnimationTransition;
}
```

## Properties

### Optional

#### **action**

- Type: `string`
- Description: The movement action. Default: `this.document.movementAction`.

#### **chain**

- Type: `boolean`
- Description: Chain the animation to the existing one of the same name? Default: `false`.

#### **duration**

- Type: `number`
- Description: The duration of the animation in milliseconds (nonnegative). Default: automatic (determined by [foundry.canvas.placeables.Token#_getAnimationDuration](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_getanimationduration), which returns 1000 by default unless it's a movement animation).

#### **easing**

- Type: [CanvasAnimationEasingFunction](https://foundryvtt.com/api/types/foundry.canvas.animation.types.CanvasAnimationEasingFunction.html)
- Description: The easing function of the animation. Default: `undefined` (linear).

#### **movementSpeed**

- Type: `number`
- Description: A desired base movement speed in grid size per second (positive), which determines the duration if the given `duration` is undefined and either `x`, `y`, `width`, `height`, or `rotation` is animated. Default: automatic (determined by [foundry.canvas.placeables.Token#_getAnimationMovementSpeed](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_getanimationmovementspeed)).

#### **name**

- Type: `null | string | symbol`
- Description: The name of the animation, or `null` if nameless. Default: [foundry.canvas.placeables.Token#animationName](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#animationname).

#### **ontick**

- Type: `(elapsedMS: number, animation: CanvasAnimationData, data: TokenAnimationData) => void`
- Description: An on-tick callback.

#### **terrain**

- Type: `null | DataModel<object, DataModelConstructionContext>`
- Description: The terrain data. Default: `null`.
  - [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html)
  - [DataModelConstructionContext](https://foundryvtt.com/api/types/foundry.abstract.types.DataModelConstructionContext.html)

#### **transition**

- Type: [TokenAnimationTransition](https://foundryvtt.com/api/types/foundry.types.TokenAnimationTransition.html)
- Description: The desired texture transition type. Default: automatic (determined by [foundry.canvas.placeables.Token#_getAnimationTransition](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_getanimationtransition), which returns `"fade"` by default).

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)