# TourConfig

Tour configuration data

```typescript
interface TourConfig {
    /** Whether the Tour can be resumed or if it always needs to start from the beginning. Defaults to false. */
    canBeResumed?: boolean;

    /** A human-readable description of this Tour. Localized. */
    description?: string;

    /** Whether the Tour should be displayed in the Manage Tours UI. Defaults to false. */
    display?: boolean;

    /** A machine-friendly id of the Tour, must be unique within the provided namespace */
    id: string;

    /** A map of localizations for the Tour that should be merged into the default localizations */
    localization?: object;

    /** The namespace this Tour belongs to. Typically, the name of the package which implements the tour should be used */
    namespace: string;

    /** Whether the Tour is restricted to the GM only. Defaults to false. */
    restricted?: boolean;

    /** The list of Tour Steps */
    steps: TourStep[];

    /** A list of namespaced Tours that might be suggested to the user when this Tour is completed. The first non-completed Tour in the array will be recommended. */
    suggestedNextTours?: string[];

    /** A human-readable name for this Tour. Localized. */
    title: string;
}
```

## Properties

- **canBeResumed?**: `boolean`  
  Whether the Tour can be resumed or if it always needs to start from the beginning. Defaults to false.

- **description?**: `string`  
  A human-readable description of this Tour. Localized.

- **display?**: `boolean`  
  Whether the Tour should be displayed in the Manage Tours UI. Defaults to false.

- **id**: `string`  
  A machine-friendly id of the Tour, must be unique within the provided namespace.

- **localization?**: `object`  
  A map of localizations for the Tour that should be merged into the default localizations.

- **namespace**: `string`  
  The namespace this Tour belongs to. Typically, the name of the package which implements the tour should be used.

- **restricted?**: `boolean`  
  Whether the Tour is restricted to the GM only. Defaults to false.

- **steps**: `TourStep[]`  
  The list of Tour Steps. (See [TourStep](https://foundryvtt.com/api/interfaces/foundry.TourStep.html))

- **suggestedNextTours?**: `string[]`  
  A list of namespaced Tours that might be suggested to the user when this Tour is completed. The first non-completed Tour in the array will be recommended.

- **title**: `string`  
  A human-readable name for this Tour. Localized.

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).