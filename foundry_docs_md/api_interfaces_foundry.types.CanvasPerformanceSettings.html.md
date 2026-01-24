# CanvasPerformanceSettings

```typescript
interface CanvasPerformanceSettings {
    fps: number;
    lightAnimation: boolean;
    lightSoftEdges: boolean;
    mipmap: string;
    mode: CanvasPerformanceMode;
    msaa: boolean;
    smaa: boolean;
    tokenAnimation: boolean;
}
```

## Properties

- **fps**: `number`  
  Maximum framerate which should be the render target

- **lightAnimation**: `boolean`  
  Whether to display light source animation

- **lightSoftEdges**: `boolean`  
  Whether to render soft edges for light sources

- **mipmap**: `string`  
  Whether to use mipmaps, `"ON"` or `"OFF"`

- **mode**: `CanvasPerformanceMode`  
  A performance mode in [CONST.CANVAS_PERFORMANCE_MODES](https://foundryvtt.com/api/variables/CONST.CANVAS_PERFORMANCE_MODES.html)

- **msaa**: `boolean`  
  Whether to apply MSAA at the overall canvas level

- **smaa**: `boolean`  
  Whether to apply SMAA at the overall canvas level

- **tokenAnimation**: `boolean`  
  Whether to display token movement animation