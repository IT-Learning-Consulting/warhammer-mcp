# ChoiceInputConfig

Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface ChoiceInputConfig {
    choices:
        | any[]
        | Record<string | number, any>
        | (() => any[])
        | Record<string | number, any>;
    labelAttr?: string;
    options: FormSelectOption[];
    valueAttr?: string;
}
```

## Properties

- **choices**

  ```typescript
  choices:
      | any[]
      | Record<string | number, any>
      | (() => any[])
      | Record<string | number, any>;
  ```

- **labelAttr?**  
  *optional*

  ```typescript
  labelAttr?: string;
  ```

- **options**

  ```typescript
  options: FormSelectOption[];
  ```

- **valueAttr?**  
  *optional*

  ```typescript
  valueAttr?: string;
  ```

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)