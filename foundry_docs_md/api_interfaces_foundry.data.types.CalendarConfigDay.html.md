# CalendarConfigDay | Foundry Virtual Tabletop - API Documentation - Version 13

An interface defining the days of the week within a calendar.

```typescript
interface CalendarConfigDay {
  abbreviation?: string;
  isRestDay?: boolean;
  name: string;
  ordinal: number;
}
```

## Properties

- **abbreviation?**: *string*  
  The abbreviated name of the weekday.

- **isRestDay?**: *boolean*  
  Is this weekday considered a rest day (weekend)?

- **name**: *string*  
  The full name of the weekday.

- **ordinal**: *number*  
  The ordinal position of this weekday in the week.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)