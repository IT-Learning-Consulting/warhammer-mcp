# TokenFindMovementPathOptions | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TokenFindMovementPathOptions {
    delay?: number;
    history?: boolean | readonly DeepReadonly<TokenMeasuredMovementWaypoint>[];
    ignoreCost?: boolean;
    ignoreWalls?: boolean;
    preview?: boolean;
}
```

## Properties

### **delay?**  
`number`  
Unless the path can be found instantly, delay the start of the pathfinding computation by this number of milliseconds.  
**Default:** 0.

### **history?**  
`boolean` | `readonly DeepReadonly<TokenMeasuredMovementWaypoint>[]`  
Consider movement history?  
- If `true`, uses the current movement history.  
- If waypoints are passed, use those as the history.  
**Default:** `false`.

### **ignoreCost?**  
`boolean`  
Ignore cost?  
**Default:** `false`.

### **ignoreWalls?**  
`boolean`  
Ignore walls?  
**Default:** `false`.

### **preview?**  
`boolean`  
Find a preview path?  
**Default:** `false`.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)