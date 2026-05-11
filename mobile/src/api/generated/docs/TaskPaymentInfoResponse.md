
# TaskPaymentInfoResponse


## Properties

Name | Type
------------ | -------------
`helperPhoneNumber` | string
`helperName` | string
`amount` | number
`taskReference` | string

## Example

```typescript
import type { TaskPaymentInfoResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "helperPhoneNumber": null,
  "helperName": null,
  "amount": null,
  "taskReference": null,
} satisfies TaskPaymentInfoResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TaskPaymentInfoResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


