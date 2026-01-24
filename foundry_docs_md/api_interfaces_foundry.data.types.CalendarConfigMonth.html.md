# CalendarConfigMonth

A definition of a month within a calendar year.

```typescript
interface CalendarConfigMonth {
    abbreviation?: string;
    dayOffset?: number;
    days: number;
    intercalary?: boolean;
    leapDays?: number;
    name: string;
    ordinal: number;
    startingWeekday?: null | number;
}
```

## Properties

### abbreviation?  
**Type:** `string`  
The abbreviated name of the month.

### dayOffset?  
**Type:** `number`  
The amount to offset day numbers for this month.

### days  
**Type:** `number`  
The number of days in the month.

### intercalary?  
**Type:** `boolean`  
If this month is an intercalary month.

### leapDays?  
**Type:** `number`  
The number of days in the month during a leap year. If not defined the value of `days` is used.

### name  
**Type:** `string`  
The full name of the month.

### ordinal  
**Type:** `number`  
The ordinal position of this month in the year.

### startingWeekday?  
**Type:** `null | number`  
The day of the week this month should always start on. If the value is `null`, the month will start on the next weekday after the previous month.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)