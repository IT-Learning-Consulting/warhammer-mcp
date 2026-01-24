# CalendarConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface CalendarConfig {
    days: CalendarConfigDays;
    description: string;
    months: null | CalendarConfigMonths;
    name: string;
    seasons: null | CalendarConfigSeasons;
    years: CalendarConfigYears;
}
```

## Properties

### **days**

- Type: [CalendarConfigDays](https://foundryvtt.com/api/interfaces/foundry.data.types.CalendarConfigDays.html)

Configuration of days.

### **description**

- Type: `string`

A text description of the calendar configuration.

### **months**

- Type: `null | [CalendarConfigMonths](https://foundryvtt.com/api/interfaces/foundry.data.types.CalendarConfigMonths.html)`

Configuration of months.

### **name**

- Type: `string`

The name of the calendar being used.

### **seasons**

- Type: `null | [CalendarConfigSeasons](https://foundryvtt.com/api/interfaces/foundry.data.types.CalendarConfigSeasons.html)`

Configuration of seasons.

### **years**

- Type: [CalendarConfigYears](https://foundryvtt.com/api/interfaces/foundry.data.types.CalendarConfigYears.html)

Configuration of years.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)