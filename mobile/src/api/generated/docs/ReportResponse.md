
# ReportResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`reportedUserId` | string
`reason` | string
`description` | string
`status` | string
`createdAt` | Date

## Example

```typescript
import type { ReportResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "reportedUserId": null,
  "reason": null,
  "description": null,
  "status": null,
  "createdAt": null,
} satisfies ReportResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ReportResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


