# DeepPartial | Foundry Virtual Tabletop - API Documentation - Version 13

### Type Alias DeepPartial<T>

```typescript
type DeepPartial<T> = 
  T extends Builtin 
    ? T 
    : T extends (infer U)[]
      ? DeepPartial<U>[]
      : T extends ReadonlyArray<infer U>
        ? ReadonlyArray<DeepPartial<U>>
        : T extends {}
          ? { [K in keyof T]?: DeepPartial<T[K]> }
          : Partial<T>;
```

#### Type Parameters

- **T**

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)