# CalendarConfigLeapYear | Foundry Virtual Tabletop - API Documentation - Version 13

An interface defining how leap years work within a calendar.

```typescript
interface CalendarConfigLeapYear {
    leapInterval: number;
    leapStart: number;
}
```

## Properties

- **leapInterval**: *number*  
  The number of years between leap years.

- **leapStart**: *number*  
  The year number of the first leap year. On or after yearZero.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)