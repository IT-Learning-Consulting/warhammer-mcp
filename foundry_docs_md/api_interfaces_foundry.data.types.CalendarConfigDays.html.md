# CalendarConfigDays | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface CalendarConfigDays {
    daysPerYear?: number;
    hoursPerDay?: number;
    minutesPerHour?: number;
    secondsPerMinute?: number;
    values: CalendarConfigDay[];
}
```

Day related configuration for a calendar.

## Properties

- **daysPerYear?**: *number*  
  The number of days in a year.

- **hoursPerDay?**: *number*  
  The number of hours in a day.

- **minutesPerHour?**: *number*  
  The number of minutes in an hour.

- **secondsPerMinute?**: *number*  
  The number of seconds in a minute.

- **values**: [*CalendarConfigDay*](https://foundryvtt.com/api/interfaces/foundry.data.types.CalendarConfigDay.html)[]  
  The configuration of the days of the week.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)