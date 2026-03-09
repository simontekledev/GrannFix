
# OfferResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`helperId` | string
`proposedPrice` | number
`message` | string
`status` | string
`createdAt` | Date

## Example

```typescript
import type { OfferResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "helperId": null,
  "proposedPrice": null,
  "message": null,
  "status": null,
  "createdAt": null,
} satisfies OfferResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as OfferResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


