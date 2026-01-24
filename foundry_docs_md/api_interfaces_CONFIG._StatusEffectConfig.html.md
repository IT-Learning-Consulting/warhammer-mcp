# _StatusEffectConfig | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface _StatusEffectConfig {
    hud?: boolean | { actorTypes?: string[] };
    icon?: string;
    id: string;
    label?: string;
}
```

## Properties

### **hud?**  
_Type: boolean \| { actorTypes?: string[] }_  
Should this effect appear in the Token HUD? This effect is only selectable in the Token HUD if the Token's Actor sub-type is one of the configured ones.

### **icon?**  
_Type: string_  
DEPRECATED alias for `"img"`.

### **id**  
_Type: string_  
A string identifier for the effect.

### **label?**  
_Type: string_  
DEPRECATED alias for `"name"`.

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)