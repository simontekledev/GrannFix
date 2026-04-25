
# AdminReportDto


## Properties

Name | Type
------------ | -------------
`id` | string
`reporterId` | string
`reporterName` | string
`reportedUserId` | string
`reportedUserName` | string
`reason` | string
`description` | string
`contextTaskId` | string
`contextChatId` | string
`status` | string
`adminNotes` | string
`createdAt` | Date
`updatedAt` | Date

## Example

```typescript
import type { AdminReportDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "reporterId": null,
  "reporterName": null,
  "reportedUserId": null,
  "reportedUserName": null,
  "reason": null,
  "description": null,
  "contextTaskId": null,
  "contextChatId": null,
  "status": null,
  "adminNotes": null,
  "createdAt": null,
  "updatedAt": null,
} satisfies AdminReportDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as AdminReportDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


