# AmbientSoundData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface AmbientSoundData {
    _id: null | string;
    darkness: { max: number; min: number };
    easing: boolean;
    effects: { 
      base: AmbientSoundEffect; 
      muffled: AmbientSoundEffect 
    };
    elevation?: number;
    flags: DocumentFlags;
    hidden: boolean;
    path: string;
    radius: number;
    repeat?: boolean;
    volume?: number;
    walls: boolean;
    x: number;
    y: number;
}
```

## Properties

### **_id**

- Type: `null | string`
- Description: The _id which uniquely identifies this AmbientSound document

### **darkness**

- Type: `{ max: number; min: number }`
- Description: A darkness range (min and max) for which the source should be active

### **easing**

- Type: `boolean`
- Description: Whether to adjust the volume of the sound heard by the listener based on how close the listener is to the center of the sound source. True by default.

### **effects**

- Type:  
  ```typescript
  {
    base: AmbientSoundEffect;
    muffled: AmbientSoundEffect;
  }
  ```
- Description: Special effects to apply to the sound  
- See: [AmbientSoundEffect](https://foundryvtt.com/api/interfaces/foundry.documents.types.AmbientSoundEffect.html)

### **elevation** (Optional)

- Type: `number`
- Description: The elevation

### **flags**

- Type: `DocumentFlags`
- Description: An object of optional key/value flags  
- See: [DocumentFlags](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)

### **hidden**

- Type: `boolean`
- Description: Is the sound source currently hidden? False by default.

### **path**

- Type: `string`
- Description: The audio file path that is played by this sound

### **radius**

- Type: `number`
- Description: The radius of the emitted sound.

### **repeat** (Optional)

- Type: `boolean`
- Description: Does this sound loop?

### **volume** (Optional)

- Type: `number`
- Description: The audio volume of the sound, from 0 to 1

### **walls**

- Type: `boolean`
- Description: Whether or not this sound source is constrained by Walls. True by default.

### **x**

- Type: `number`
- Description: The x-coordinate position of the origin of the sound.

### **y**

- Type: `number`
- Description: The y-coordinate position of the origin of the sound.

---

For more information, see the [Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html).