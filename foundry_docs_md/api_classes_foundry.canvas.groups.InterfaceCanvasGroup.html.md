# InterfaceCanvasGroup

A container group which displays interface elements rendered above other canvas groups.

## Hierarchy

*any*  
**InterfaceCanvasGroup**

## Static Properties

### groupName

```typescript
groupName: string = "interface"
```

## Methods

### _draw

```typescript
_draw(options: any): Promise<void>
```

**Parameters**

- **options**: *any*

**Returns**  
*Promise<void>*

### addDrawing

```typescript
addDrawing(drawing: canvas.placeables.Drawing): Graphics
```

Add a PrimaryGraphics to the group.

**Parameters**

- **drawing**: *canvas.placeables.Drawing*  
  The Drawing being added

**Returns**  
*Graphics*  
The created Graphics instance

### createScrollingText

```typescript
createScrollingText(
    origin: Point,
    content: string,
    options?: {
        anchor?: TextAnchorPoint;
        direction?: TextAnchorPoint;
        distance?: number;
        duration?: number;
        jitter?: number;
        textStyle?: object;
    },
): Promise<void>
```

Display scrolling status text originating from an origin point on the Canvas.

**Parameters**

- **origin**: *Point*  
  An origin point where the text should first emerge

- **content**: *string*  
  The text content to display

- **options?**: *{*
    - **anchor?**: [TextAnchorPoint](https://foundryvtt.com/api/types/CONST.TextAnchorPoint.html)  
      The original anchor point where the text appears
    - **direction?**: [TextAnchorPoint](https://foundryvtt.com/api/types/CONST.TextAnchorPoint.html)  
      The direction in which the text scrolls
    - **distance?**: *number*  
      The distance in pixels that the scrolling text should travel
    - **duration?**: *number*  
      The duration of the scrolling effect in milliseconds
    - **jitter?**: *number*  
      An amount of randomization between [0, 1] applied to the initial position
    - **textStyle?**: *object*  
      Additional parameters of PIXI.TextStyle which are applied to the text  
  *} = {}*

**Returns**  
*Promise<void>*  
A promise that resolves after the scrolling text animation ended.

### removeDrawing

```typescript
removeDrawing(drawing: canvas.placeables.Drawing): void
```

Remove a PrimaryGraphics from the group.

**Parameters**

- **drawing**: *canvas.placeables.Drawing*  
  The Drawing being removed

**Returns**  
*void*