# Notification

```typescript
interface Notification {
    active: boolean;
    console: boolean;
    element?: HTMLLIElement;
    error?: Error;
    id: number;
    message: string;
    pct: number;
    permanent: boolean;
    progress: boolean;
    remove?: () => void;
    timestamp: number;
    type: string;
    update?: (pct: number) => void;
}
```

## Properties

- **active**: `boolean`

- **console**: `boolean`

- **element** (optional): `HTMLLIElement`

- **error** (optional): `Error`

- **id**: `number`

- **message**: `string`

- **pct**: `number`

- **permanent**: `boolean`

- **progress**: `boolean`

- **remove** (optional): `() => void`

- **timestamp**: `number`

- **type**: `string`

- **update** (optional): `(pct: number) => void`

---

For more information visit the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/).