# ApplicationClickAction

An on-click action supported by the Application. Run in the context of a  
[foundry.applications.api.HandlebarsApplicationMixin](https://foundryvtt.com/api/functions/foundry.applications.api.HandlebarsApplicationMixin.html).

## Type Declaration

```typescript
(event: PointerEvent, target: HTMLElement) => void | Promise<void>
```

## Parameters

- **event**: `PointerEvent`  
  The originating click event

- **target**: `HTMLElement`  
  The capturing HTML element which defines the `[data-action]`

## Returns

`void | Promise<void>`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)