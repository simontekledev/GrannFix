
# CreateReportRequest


## Properties

Name | Type
------------ | -------------
`reportedUserId` | string
`reason` | string
`description` | string
`contextTaskId` | string
`contextChatId` | string

## Example

```typescript
import type { CreateReportRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "reportedUserId": null,
  "reason": null,
  "description": null,
  "contextTaskId": null,
  "contextChatId": null,
} satisfies CreateReportRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateReportRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


