# DeepReadonly | Foundry Virtual Tabletop - API Documentation - Version 13

**Type Alias** `DeepReadonly<T>`

```typescript
type DeepReadonly<T> = {
    readonly [K in keyof T]: 
        T[K] extends
            | undefined
            | null
            | boolean
            | number
            | string
            | symbol
            | bigint
            | Function
            ? T[K]
            : T[K] extends (infer V)[]
                ? ReadonlyArray<DeepReadonly<V>>
                : T[K] extends Map<infer K, infer V>
                    ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
                    : T[K] extends Set<infer V>
                        ? ReadonlySet<DeepReadonly<V>>
                        : DeepReadonly<T[K]>
}
```

Make all properties in `T` recursively readonly.

### Type Parameters

- **T**: The type to make deeply readonly.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)