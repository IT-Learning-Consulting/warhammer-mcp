# dropCanvasData | Foundry Virtual Tabletop - API Documentation - Version 13

### Function dropCanvasData

```typescript
dropCanvasData(canvas: canvas.Canvas, data: any, event: DragEvent): void
```

A hook event that fires when some useful data is dropped onto the Canvas.

#### Parameters

- **canvas**: `canvas.Canvas`  
  The Canvas instance

- **data**: `any`  
  The data that has been dropped onto the Canvas, which includes the canvas coordinates (x, y) and the data returned by [foundry.applications.ux.TextEditor.implementation.getDragEventData](https://foundryvtt.com/api/classes/foundry.applications.ux.TextEditor.html#getdrageventdata)

- **event**: `DragEvent`  
  The drag event

#### Returns

`void`

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)