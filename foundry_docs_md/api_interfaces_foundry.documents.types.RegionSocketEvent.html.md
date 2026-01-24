# RegionSocketEvent | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface RegionSocketEvent {
    eventData: object;
    eventDataUuids: string[];
    eventName: RegionEventType;
    regionUuid: string;
    userId: string;
}
```

## Properties

- **eventData**: `object`  
  The data of the event

- **eventDataUuids**: `string[]`  
  The keys of the event data that are Documents

- **eventName**: [`RegionEventType`](https://foundryvtt.com/api/types/CONST.RegionEventType.html)  
  The name of the event (see [CONST.REGION_EVENTS](https://foundryvtt.com/api/variables/CONST.REGION_EVENTS.html))

- **regionUuid**: `string`  
  The UUID of the Region the event was triggered on

- **userId**: `string`  
  The ID of the User that triggered the event