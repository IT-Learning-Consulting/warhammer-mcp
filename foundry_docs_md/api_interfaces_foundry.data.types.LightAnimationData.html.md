# LightAnimationData | Foundry Virtual Tabletop - API Documentation - Version 13

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [data](https://foundryvtt.com/api/modules/foundry.data.html) / [types](https://foundryvtt.com/api/modules/foundry.data.types.html) / [LightAnimationData](https://foundryvtt.com/api/interfaces/foundry.data.types.LightAnimationData.html)

## Interface LightAnimationData

```typescript
interface LightAnimationData {
    intensity: number;
    reverse: boolean;
    speed: number;
    type: string;
}
```

## Properties

- **intensity**: `number`  
  The intensity of the animation, a number between 1 and 10

- **reverse**: `boolean`  
  Reverse the direction of animation.

- **speed**: `number`  
  The speed of the animation, a number between 0 and 10

- **type**: `string`  
  The animation type which is applied