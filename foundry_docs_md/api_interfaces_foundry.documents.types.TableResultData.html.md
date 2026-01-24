# TableResultData | Foundry Virtual Tabletop - API Documentation - Version 13

```typescript
interface TableResultData {
  _id: null | string;
  documentCollection?: string;
  documentId?: string;
  drawn?: boolean;
  flags: DocumentFlags;
  img?: string;
  range?: number[];
  text?: string;
  type?: string;
  weight?: number;
}
```

## Properties

- **_id**: `null | string`  
  The _id which uniquely identifies this TableResult embedded document

- **documentCollection** *(optional)*: `string`  
  A named collection from which this result is drawn

- **documentId** *(optional)*: `string`  
  The _id of a Document within the collection this result references

- **drawn** *(optional)*: `boolean`  
  Has this result already been drawn (without replacement)

- **flags**: [`DocumentFlags`](https://foundryvtt.com/api/types/foundry.data.types.DocumentFlags.html)  
  An object of optional key/value flags

- **img** *(optional)*: `string`  
  An image file url that represents the table result

- **range** *(optional)*: `number[]`  
  A length 2 array of ascending integers which defines the range of dice roll totals which produce this drawn result

- **text** *(optional)*: `string`  
  The text which describes the table result

- **type** *(optional)*: `string`  
  A result subtype from `CONST.TABLE_RESULT_TYPES`

- **weight** *(optional)*: `number`  
  The probabilistic weight of this result relative to other results

---

[Foundry Virtual Tabletop - API Documentation - Version 13](https://foundryvtt.com/api/index.html)