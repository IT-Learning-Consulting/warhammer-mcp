# TokenAnimationContext | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TokenAnimationContext {
  chain: {
    options: Omit<TokenAnimationOptions, "duration"> & { duration: number };
    promise: Promise<void>;
    reject: (error: Error) => void;
    resolve: () => void;
    to: Partial<TokenAnimationData>;
  }[];

  duration: number;
  name: string | symbol;
  onAnimate: (context: TokenAnimationContext) => void[];
  postAnimate: (context: TokenAnimationContext) => void[];
  preAnimate: (context: TokenAnimationContext) => Promise<void>[];
  promise: Promise<void>;
  time: number;
  to: Partial<TokenAnimationData>;
}
```

## Properties

### chain

- **chain**: Array of objects containing:
  - **options**: `Omit<TokenAnimationOptions, "duration"> & { duration: number }`
  - **promise**: `Promise<void>`
  - **reject**: `(error: Error) => void`
  - **resolve**: `() => void`
  - **to**: `Partial<TokenAnimationData>`

The animation chain.

### duration

- **duration**: `number`

The duration of the animation.

### name

- **name**: `string | symbol`

The name of the animation.

### onAnimate

- **onAnimate**: `(context: TokenAnimationContext) => void[]`

Synchronous functions that are executed each frame after `ontick` and before [`foundry.canvas.placeables.Token#_onAnimationUpdate`](https://foundryvtt.com/api/classes/foundry.canvas.placeables.Token.html#_onAnimationUpdate).

### postAnimate

- **postAnimate**: `(context: TokenAnimationContext) => void[]`

Synchronous functions executed after the animation ends. They may run before the `preAnimate` functions have finished if the animation is terminated.

### preAnimate

- **preAnimate**: `(context: TokenAnimationContext) => Promise<void>[]`

Asynchronous functions that are executed before the animation starts.

### promise

- **promise**: `Promise<void>`

The promise of the animation that resolves once it completes or is terminated.

### time

- **time**: `number`

The current time of the animation.

### to

- **to**: `Partial<TokenAnimationData>`

The final animation state.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)