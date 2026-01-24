# time | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
time: {
    earthCalendarClass: typeof CalendarData;
    earthCalendarConfig: CalendarConfig;
    formatters: Record<string, TimeFormatter>;
    roundTime: number;
    turnTime: number;
    worldCalendarClass: typeof CalendarData;
    worldCalendarConfig: CalendarConfig;
} = ...
```

Configuration for time tracking.

### Properties

- **earthCalendarClass**: `typeof CalendarData`  
  The `CalendarData` subclass is used for IRL timekeeping.  
  See: [CalendarData](https://foundryvtt.com/api/classes/foundry.data.CalendarData.html)

- **earthCalendarConfig**: `CalendarConfig`  
  The Calendar configuration used for IRL timekeeping.  
  See: [CalendarConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.CalendarConfig.html)

- **formatters**: `Record<string, TimeFormatter>`  
  Formatting functions used to display time data as strings.

- **roundTime**: `number`  
  The number of seconds which automatically elapse at the end of a Combat round.

- **turnTime**: `number`  
  The number of seconds which automatically elapse at the end of a Combat turn.

- **worldCalendarClass**: `typeof CalendarData`  
  The `CalendarData` subclass is used for in-world timekeeping.  
  See: [CalendarData](https://foundryvtt.com/api/classes/foundry.data.CalendarData.html)

- **worldCalendarConfig**: `CalendarConfig`  
  The Calendar configuration used for in-world timekeeping.  
  See: [CalendarConfig](https://foundryvtt.com/api/interfaces/foundry.data.types.CalendarConfig.html)

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)