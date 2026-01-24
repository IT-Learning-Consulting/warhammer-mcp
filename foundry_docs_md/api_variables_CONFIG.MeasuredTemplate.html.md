# MeasuredTemplate | Foundry Virtual Tabletop - API Documentation - Version 13

**MeasuredTemplate Const**

Configuration for the MeasuredTemplate embedded document type and its representation on the game Canvas

```typescript
MeasuredTemplate: {
    defaults: { angle: number; width: number };
    documentClass: typeof MeasuredTemplateDocument;
    layerClass: typeof TemplateLayer;
    objectClass: typeof canvas.placeables.MeasuredTemplate;
} = ...
```

- **defaults**:  
  - **angle**: *number*  
  - **width**: *number*

- **documentClass**: `typeof` [MeasuredTemplateDocument](https://foundryvtt.com/api/classes/foundry.documents.MeasuredTemplateDocument.html)

- **layerClass**: `typeof` [TemplateLayer](https://foundryvtt.com/api/classes/foundry.canvas.layers.TemplateLayer.html)

- **objectClass**: `typeof` [canvas.placeables.MeasuredTemplate](https://foundryvtt.com/api/classes/foundry.canvas.placeables.MeasuredTemplate.html)

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)