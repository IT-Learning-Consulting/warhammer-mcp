# CalendarConfigYears | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface CalendarConfigYears

A definition of a year within a calendar.

```typescript
interface CalendarConfigYears {
    firstWeekday?: number;
    leapYear?: null | CalendarConfigLeapYear;
    yearZero?: number;
}
```

### Properties

- **firstWeekday?**: *number*  
  The index of `days.values` that is the first weekday at time=0.

- **leapYear?**: *null* | [CalendarConfigLeapYear](https://foundryvtt.com/api/interfaces/foundry.data.types.CalendarConfigLeapYear.html)  
  A definition of how leap years work within a calendar.

- **yearZero?**: *number*  
  The year which is considered year 0 in the calendar.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)