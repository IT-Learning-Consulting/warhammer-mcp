# queries

**Variable** `queries`  **Const**

System and modules must prefix the names of the queries they register (e.g. `"my-module.aCustomQuery"`). Non-prefixed query names are reserved by core.

```typescript
queries: {
  confirmTeleportToken: (
    queryData: { behaviorUuid: string; token: any },
  ) => Promise<boolean>;

  dialog: (
    __namedParameters: {
      config: object;
      type: "input" | "wait" | "prompt" | "confirm";
    },
  ) => Promise<any>;
} = ...
```

### confirmTeleportToken

```typescript
(
  queryData: {
    behaviorUuid: string;
    token: any;
  }
) => Promise<boolean>
```

### dialog

```typescript
(
  __namedParameters: {
    config: object;
    type: "input" | "wait" | "prompt" | "confirm";
  },
) => Promise<any>
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)