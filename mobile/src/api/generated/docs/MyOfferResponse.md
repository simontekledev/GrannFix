
# MyOfferResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`status` | string
`proposedPrice` | number
`createdAt` | Date
`task` | [TaskSummary](TaskSummary.md)

## Example

```typescript
import type { MyOfferResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "status": null,
  "proposedPrice": null,
  "createdAt": null,
  "task": null,
} satisfies MyOfferResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MyOfferResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


