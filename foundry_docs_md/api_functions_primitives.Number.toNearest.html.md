# toNearest | Foundry Virtual Tabletop - API Documentation - Version 13

### Function toNearest

```typescript
toNearest(
    interval?: number,
    method?: "round" | "floor" | "ceil",
    base?: number,
): number
```

Round a number to the closest number which subtracted from the base is a multiple of the provided interval. This is a convenience function intended to humanize issues of floating point precision. The interval is treated as a standard string representation to determine the amount of decimal truncation applied.

**Parameters**

- **interval**: *number* = 1  
  The step interval  
  Optional

- **method**: *"round" | "floor" | "ceil"* = "round"  
  The rounding method  
  Optional

- **base**: *number* = 0  
  The step base

**Returns**  
*number*  
The rounded number

**Example: Round a number to the nearest step interval**

```typescript
let n = 17.18;
n.toNearest(5); // 15
n.toNearest(10); // 20
n.toNearest(10, "floor"); // 10
n.toNearest(10, "ceil"); // 20
n.toNearest(0.25); // 17.25
n.toNearest(2, "round", 1); // 17
```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)