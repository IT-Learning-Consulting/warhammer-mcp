# CalendarConfigSeason | Foundry Virtual Tabletop - API Documentation - Version 13

An interface defining a season within a calendar year.

```typescript
interface CalendarConfigSeason {
    abbreviation?: string;
    endDay: null | number;
    endMonth: null | number;
    name: string;
    startDay: null | number;
    startMonth: null | number;
}
```

## Properties

### Optional

- **abbreviation**?: `string`  
  The abbreviated name of the season.

### Required

- **endDay**: `null` | `number`  
  The day of the month on which the season ends.

- **endMonth**: `null` | `number`  
  The ordinal month in which the season ends.

- **name**: `string`  
  The full name of the season.

- **startDay**: `null` | `number`  
  The day of the month on which the season starts.

- **startMonth**: `null` | `number`  
  The ordinal month in which the season starts.

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)  
[Modules Documentation](https://foundryvtt.com/api/modules.html) / [foundry](https://foundryvtt.com/api/modules/foundry.html) / [data](https://foundryvtt.com/api/modules/foundry.data.html) / [types](https://foundryvtt.com/api/modules/foundry.data.types.html) / [CalendarConfigSeason Interface](https://foundryvtt.com/api/interfaces/foundry.data.types.CalendarConfigSeason.html)