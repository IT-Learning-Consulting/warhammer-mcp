# PreciseText | Foundry Virtual Tabletop - API Documentation - Version 13

An extension of the default `PIXI.Text` object which forces double resolution. At default resolution, Text often looks blurry or fuzzy.

## Hierarchy

* _Text_
* **PreciseText**

## Methods

### Static Methods

#### getTextStyle

```typescript
getTextStyle(options?: { anchor?: number }): TextStyle
```

Prepare a `TextStyle` object which merges the canvas defaults with user-provided options.

**Parameters**

- **options?**: `{ anchor?: number } = {}`  
  Additional options merged with the default `TextStyle`.

  - **anchor?**: `number`  
    A text anchor point from `CONST.TEXT_ANCHOR_POINTS`.

**Returns**  
`TextStyle`  
The prepared `TextStyle`.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)