
# ChatSummaryResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`taskId` | string
`taskTitle` | string
`otherPartyName` | string
`lastMessage` | string
`lastMessageAt` | Date

## Example

```typescript
import type { ChatSummaryResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "taskId": null,
  "taskTitle": null,
  "otherPartyName": null,
  "lastMessage": null,
  "lastMessageAt": null,
} satisfies ChatSummaryResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as ChatSummaryResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


