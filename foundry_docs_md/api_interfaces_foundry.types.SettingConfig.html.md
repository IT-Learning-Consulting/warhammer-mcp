# SettingConfig | Foundry Virtual Tabletop - API Documentation - Version 13

## Interface SettingConfig

A Client Setting

```typescript
interface SettingConfig {
    choices?: Object;
    config: boolean;
    default?: any;
    hint: string;
    id?: string;
    input?: CustomFormInput;
    key: string;
    name: string;
    namespace: string;
    onChange?: Function;
    range?: Object;
    scope: string;
    type: BuiltinType | typeof DataModel | DataField;
}
```

## Properties

### **choices?**  
_Type: Object_  
For string Types, defines the allowable values.

### **config**  
_Type: boolean_  
Indicates if this Setting should render in the Config application.

### **default?**  
_Type: any_  
The default value.

### **hint**  
_Type: string_  
An additional human-readable hint.

### **id?**  
_Type: string_  
The combination of `{namespace}.{key}`.

### **input?**  
_Type: [CustomFormInput](https://foundryvtt.com/api/types/foundry.applications.fields.CustomFormInput.html)_  
A custom form field input used in conjunction with a DataField type.

### **key**  
_Type: string_  
A unique machine-readable id for the setting.

### **name**  
_Type: string_  
The human-readable name.

### **namespace**  
_Type: string_  
The namespace the setting belongs to.

### **onChange?**  
_Type: Function_  
Executes when the value of this Setting changes.

### **range?**  
_Type: Object_  
For numeric Types, defines the allowable range.

### **scope**  
_Type: string_  
The scope the Setting is stored in, either World or Client.

### **type**  
_Type: [BuiltinType](https://foundryvtt.com/api/types/foundry.types.BuiltinType.html) | typeof [DataModel](https://foundryvtt.com/api/classes/foundry.abstract.DataModel.html) | [DataField](https://foundryvtt.com/api/classes/foundry.data.fields.DataField.html)_  
The type of data stored by this Setting.