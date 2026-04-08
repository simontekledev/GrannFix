
# PageableObject


## Properties

Name | Type
------------ | -------------
`paged` | boolean
`pageSize` | number
`pageNumber` | number
`unpaged` | boolean
`offset` | number
`sort` | [SortObject](SortObject.md)

## Example

```typescript
import type { PageableObject } from ''

// TODO: Update the object below with actual values
const example = {
  "paged": null,
  "pageSize": null,
  "pageNumber": null,
  "unpaged": null,
  "offset": null,
  "sort": null,
} satisfies PageableObject

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PageableObject
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


