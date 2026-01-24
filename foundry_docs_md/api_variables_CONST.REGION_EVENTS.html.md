# REGION_EVENTS | Foundry Virtual Tabletop - API Documentation - Version 13

## Variable REGION_EVENTS Const

```typescript
REGION_EVENTS: {
    BEHAVIOR_ACTIVATED: "behaviorActivated";
    BEHAVIOR_DEACTIVATED: "behaviorDeactivated";
    BEHAVIOR_UNVIEWED: "behaviorUnviewed";
    BEHAVIOR_VIEWED: "behaviorViewed";
    REGION_BOUNDARY: "regionBoundary";
    TOKEN_ANIMATE_IN: "tokenAnimateIn";
    TOKEN_ANIMATE_OUT: "tokenAnimateOut";
    TOKEN_ENTER: "tokenEnter";
    TOKEN_EXIT: "tokenExit";
    TOKEN_MOVE_IN: "tokenMoveIn";
    TOKEN_MOVE_OUT: "tokenMoveOut";
    TOKEN_MOVE_WITHIN: "tokenMoveWithin";
    TOKEN_ROUND_END: "tokenRoundEnd";
    TOKEN_ROUND_START: "tokenRoundStart";
    TOKEN_TURN_END: "tokenTurnEnd";
    TOKEN_TURN_START: "tokenTurnStart";
} = ...
```

The Region events that are supported by core.

---

### BEHAVIOR_ACTIVATED  
**Type:** `"behaviorActivated"`

Triggered when the Region Behavior becomes active, i.e. is enabled or created without being disabled.  
The event is triggered only for this Region Behavior.

**See:** [foundry.documents.types.RegionBehaviorActivatedEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionBehaviorActivatedEvent.html)

---

### BEHAVIOR_DEACTIVATED  
**Type:** `"behaviorDeactivated"`

Triggered when the Region Behavior becomes inactive, i.e. is disabled or deleted without being disabled.  
The event is triggered only for this Region Behavior.

**See:** [foundry.documents.types.RegionBehaviorDeactivatedEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionBehaviorDeactivatedEvent.html)

---

### BEHAVIOR_UNVIEWED  
**Type:** `"behaviorUnviewed"`

Triggered when the Region Behavior becomes unviewed, i.e. inactive or the Scene of its Region is unviewed.  
The event is triggered only for this Region Behavior.

**See:** [foundry.documents.types.RegionBehaviorUnviewedEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionBehaviorUnviewedEvent.html)

---

### BEHAVIOR_VIEWED  
**Type:** `"behaviorViewed"`

Triggered when the Region Behavior becomes viewed, i.e. active and the Scene of its Region is viewed.  
The event is triggered only for this Region Behavior.

**See:** [foundry.documents.types.RegionBehaviorViewedEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionBehaviorViewedEvent.html)

---

### REGION_BOUNDARY  
**Type:** `"regionBoundary"`

Triggered when the shapes or bottom/top elevation of the Region are changed.

**See:** [foundry.documents.types.RegionRegionBoundaryEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionRegionBoundaryEvent.html)

---

### TOKEN_ANIMATE_IN  
**Type:** `"tokenAnimateIn"`

Triggered when a Token animates into a Region.  
This event is only triggered if the Scene the Token is in is viewed.

**See:** [foundry.documents.types.RegionTokenAnimateInEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionTokenAnimateInEvent.html)

---

### TOKEN_ANIMATE_OUT  
**Type:** `"tokenAnimateOut"`

Triggered when a Token animates out of a Region.  
This event is triggered only if the Scene the Token is in is viewed.

**See:** [foundry.documents.types.RegionTokenAnimateOutEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionTokenAnimateOutEvent.html)

---

### TOKEN_ENTER  
**Type:** `"tokenEnter"`

Triggered when a Token enters a Region.  
A Token enters a Region whenever:  
- it is created within the Region,  
- the boundary of the Region has changed such that the Token is now inside the Region,  
- the Token moves into the Region (the Token's x, y, elevation, width, height, or shape has changed such that it is now inside the Region), or  
- a Region Behavior becomes active (i.e., is enabled or created while enabled), in which case the event is triggered only for this Region Behavior.

**See:** [foundry.documents.types.RegionTokenEnterEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionTokenEnterEvent.html)

---

### TOKEN_EXIT  
**Type:** `"tokenExit"`

Triggered when a Token exits a Region.  
A Token exits a Region whenever:  
- it is deleted while inside the Region,  
- the boundary of the Region has changed such that the Token is no longer inside the Region,  
- the Token moves out of the Region (the Token's x, y, elevation, width, height, or shape has changed such that it is no longer inside the Region), or  
- a Region Behavior becomes inactive (i.e., is disabled or deleted while enabled), in which case the event is triggered only for this Region Behavior.

**See:** [foundry.documents.types.RegionTokenExitEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionTokenExitEvent.html)

---

### TOKEN_MOVE_IN  
**Type:** `"tokenMoveIn"`

Triggered when a Token moves into a Region.  
A Token moves whenever its x, y, elevation, width, height, or shape is changed.

**See:** [foundry.documents.types.RegionTokenMoveInEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionTokenMoveInEvent.html)

---

### TOKEN_MOVE_OUT  
**Type:** `"tokenMoveOut"`

Triggered when a Token moves out of a Region.  
A Token moves whenever its x, y, elevation, width, height, or shape is changed.

**See:** [foundry.documents.types.RegionTokenMoveOutEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionTokenMoveOutEvent.html)

---

### TOKEN_MOVE_WITHIN  
**Type:** `"tokenMoveWithin"`

Triggered when a Token moves within a Region.  
A token moves whenever its x, y, elevation, width, height, or shape is changed.

**See:** [foundry.documents.types.RegionTokenMoveWithinEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionTokenMoveWithinEvent.html)

---

### TOKEN_ROUND_END  
**Type:** `"tokenRoundEnd"`

Triggered when a Token ends the Combat round in a Region.

**See:** [foundry.documents.types.RegionTokenRoundEndEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionTokenRoundEndEvent.html)

---

### TOKEN_ROUND_START  
**Type:** `"tokenRoundStart"`

Triggered when a Token starts the Combat round in a Region.

**See:** [foundry.documents.types.RegionTokenRoundStartEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionTokenRoundStartEvent.html)

---

### TOKEN_TURN_END  
**Type:** `"tokenTurnEnd"`

Triggered when a Token ends its Combat turn in a Region.

**See:** [foundry.documents.types.RegionTokenTurnEndEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionTokenTurnEndEvent.html)

---

### TOKEN_TURN_START  
**Type:** `"tokenTurnStart"`

Triggered when a Token starts its Combat turn in a Region.

**See:** [foundry.documents.types.RegionTokenTurnStartEvent](https://foundryvtt.com/api/types/foundry.documents.types.RegionTokenTurnStartEvent.html)