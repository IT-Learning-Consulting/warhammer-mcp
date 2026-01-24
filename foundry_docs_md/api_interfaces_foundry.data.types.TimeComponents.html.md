# TimeComponents | Foundry Virtual Tabletop - API Documentation - Version 13

A decomposition of the integer world time in seconds into component parts. Each component expresses the number of that temporal unit since the time=0 epoch.

```typescript
interface TimeComponents {
    day: number;
    dayOfMonth: number;
    dayOfWeek: number;
    hour: number;
    leapYear: boolean;
    minute: number;
    month: number;
    season: number;
    second: number;
    year: number;
}
```

## Properties

### day
- **Type:** `number`  
- The number of days completed within the year

### dayOfMonth
- **Type:** `number`  
- The day of the month, starting from zero

### dayOfWeek
- **Type:** `number`  
- The weekday, an index of the `days.values` array

### hour
- **Type:** `number`  
- The number of hours completed within the year

### leapYear
- **Type:** `boolean`  
- Is it a leap year?

### minute
- **Type:** `number`  
- The number of minutes completed within the hour

### month
- **Type:** `number`  
- The month, an index of the `months.values` array

### season
- **Type:** `number`  
- The season, an index of the `seasons.values` array

### second
- **Type:** `number`  
- The number of seconds completed within the minute

### year
- **Type:** `number`  
- The number of years completed since zero

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)