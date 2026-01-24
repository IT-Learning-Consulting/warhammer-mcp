# ContextMenuJQueryCallback | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
type ContextMenuJQueryCallback = (target: HTMLElement | jQuery) => unknown;
```

## Type declaration

```typescript
(target: HTMLElement | jQuery): unknown
```

## Parameters

- **target**: `HTMLElement | jQuery`  
  The element that the context menu has been triggered for. Will either be a jQuery  
  object or an HTMLElement instance, depending on how the ContextMenu was  
  configured.

## Returns

- `unknown`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)