# cursors | Foundry Virtual Tabletop - API Documentation - Version 13

## Variable `cursors` Const

Configure custom cursor images to use when interacting with the application.

```typescript
cursors: {
  default: string | CONFIG.CursorDescriptor;
  "default-down": string | CONFIG.CursorDescriptor;
  grab: string | CONFIG.CursorDescriptor;
  "grab-down": string | CONFIG.CursorDescriptor;
  pointer: string | CONFIG.CursorDescriptor;
  "pointer-down": string | CONFIG.CursorDescriptor;
  text: string | CONFIG.CursorDescriptor;
  "text-down": string | CONFIG.CursorDescriptor;
} = ...
```

### Type declaration

- **default**: `string` | [CursorDescriptor](https://foundryvtt.com/api/interfaces/CONFIG.CursorDescriptor.html)
- **default-down**: `string` | [CursorDescriptor](https://foundryvtt.com/api/interfaces/CONFIG.CursorDescriptor.html)
- **grab**: `string` | [CursorDescriptor](https://foundryvtt.com/api/interfaces/CONFIG.CursorDescriptor.html)
- **grab-down**: `string` | [CursorDescriptor](https://foundryvtt.com/api/interfaces/CONFIG.CursorDescriptor.html)
- **pointer**: `string` | [CursorDescriptor](https://foundryvtt.com/api/interfaces/CONFIG.CursorDescriptor.html)
- **pointer-down**: `string` | [CursorDescriptor](https://foundryvtt.com/api/interfaces/CONFIG.CursorDescriptor.html)
- **text**: `string` | [CursorDescriptor](https://foundryvtt.com/api/interfaces/CONFIG.CursorDescriptor.html)
- **text-down**: `string` | [CursorDescriptor](https://foundryvtt.com/api/interfaces/CONFIG.CursorDescriptor.html)

### Examples

**Configuring a cursor with a hotspot in the default top-left:**

```typescript
Object.assign(CONFIG.cursors, {
  default: "icons/cursors/default.avif",
  "default-down": "icons/cursors/default-down.avif"
});
```

**Configuring a cursor with a hotspot in the center:**

```typescript
Object.assign(CONFIG.cursors, {
  default: { url: "icons/cursors/target.avif", x: 16, y: 16 },
  "default-down": { url: "icons/cursors/target-down.avif", x: 16, y: 16 }
});
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)