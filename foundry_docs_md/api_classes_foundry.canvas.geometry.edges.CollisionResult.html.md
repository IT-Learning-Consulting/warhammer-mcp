# CollisionResult

A specialized object that contains the result of a collision in the context of the [ClockwiseSweepPolygon](https://foundryvtt.com/api/modules/foundry.canvas.geometry.html). This class is not designed or intended for use outside of that context.

## Properties

- **blockedCCW**: `boolean` = `false`  
  Is this result blocking in the counter-clockwise direction?

- **blockedCCWPrev**: `boolean` = `false`  
  Previously blocking in the counter-clockwise direction?

- **blockedCW**: `boolean` = `false`  
  Is this result blocking in the clockwise direction?

- **blockedCWPrev**: `boolean` = `false`  
  Previously blocking in the clockwise direction?

- **ccwEdges**: `EdgeSet`  
  The set of edges connected to the target vertex that continue counter-clockwise.

- **collisions**: `PolygonVertex[]`  
  The array of collision points which apply to this result.

- **cwEdges**: `EdgeSet`  
  The set of edges connected to the target vertex that continue clockwise.

- **isBehind**: `boolean`  
  Is the target vertex for this result behind some closer active edge?

- **isLimited**: `boolean`  
  Does the target vertex for this result impose a limited collision?

- **limitedCCW**: `boolean` = `false`  
  Is this result limited in the counter-clockwise direction?

- **limitedCW**: `boolean` = `false`  
  Is this result limited in the clockwise direction?

- **target**: `PolygonVertex`  
  The vertex that was the target of this result.

- **wasLimited**: `boolean`  
  Has the set of collisions for this result encountered a limited edge?