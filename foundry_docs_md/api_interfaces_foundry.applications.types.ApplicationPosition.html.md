# ApplicationPosition

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)

Interface describing the position and sizing properties of an application window.

```typescript
interface ApplicationPosition {
    height: number | "auto";
    left: number;
    scale: number;
    top: number;
    width: number | "auto";
    zIndex: number;
}
```

## Properties

- **height**: `number | "auto"`  
  Un-scaled pixels in height or `"auto"`.

- **left**: `number`  
  Window offset pixels from left.

- **scale**: `number`  
  A numeric scaling factor applied to application dimensions.

- **top**: `number`  
  Window offset pixels from top.

- **width**: `number | "auto"`  
  Un-scaled pixels in width or `"auto"`.

- **zIndex**: `number`  
  A z-index of the application relative to siblings.