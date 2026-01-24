# WallDoorAnimationConfig

Interface **WallDoorAnimationConfig**

```typescript
interface WallDoorAnimationConfig {
    animate: WallDoorAnimationFunction;
    duration: number;
    easing?: string | Function;
    initialize?: WallDoorAnimationHook;
    label: string;
    midpoint?: boolean;
    postAnimate?: WallDoorAnimationHook;
    preAnimate?: WallDoorAnimationHook;
}
```

## Properties

- **animate**: [WallDoorAnimationFunction](https://foundryvtt.com/api/types/foundry.WallDoorAnimationFunction.html)  
- **duration**: `number`  
- **easing** (optional): `string` \| `Function`  
- **initialize** (optional): [WallDoorAnimationHook](https://foundryvtt.com/api/types/foundry.WallDoorAnimationHook.html)  
- **label**: `string`  
- **midpoint** (optional): `boolean`  
- **postAnimate** (optional): [WallDoorAnimationHook](https://foundryvtt.com/api/types/foundry.WallDoorAnimationHook.html)  
- **preAnimate** (optional): [WallDoorAnimationHook](https://foundryvtt.com/api/types/foundry.WallDoorAnimationHook.html)  

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)