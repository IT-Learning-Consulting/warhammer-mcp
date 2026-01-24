# soundEffects | Foundry Virtual Tabletop - API Documentation - Version 13

**Variable** `soundEffects` Const

```typescript
soundEffects: Record<
    string,
    {
        effectClass:
            | new (
                  context: BaseAudioContext,
                  options?: BiquadFilterOptions,
              ) => BiquadFilterNode
            | new (
                  context: BaseAudioContext,
                  options?: ConvolverOptions,
              ) => ConvolverNode;
        label: string;
    },
> = ...
```

An enumeration of sound effects which can be applied to Sound instances.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)