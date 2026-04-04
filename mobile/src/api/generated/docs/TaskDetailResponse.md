
# TaskDetailResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`description` | string
`city` | string
`area` | string
`street` | string
`offeredPrice` | number
`status` | string
`active` | boolean
`createdAt` | Date
`updatedAt` | Date
`completedAt` | Date
`createdBy` | [UserSummary](UserSummary.md)
`assignedTo` | [UserSummary](UserSummary.md)
`offersCount` | number
`chatId` | string
`permissions` | [Permissions](Permissions.md)

## Example

```typescript
import type { TaskDetailResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "title": null,
  "description": null,
  "city": null,
  "area": null,
  "street": null,
  "offeredPrice": null,
  "status": null,
  "active": null,
  "createdAt": null,
  "updatedAt": null,
  "completedAt": null,
  "createdBy": null,
  "assignedTo": null,
  "offersCount": null,
  "chatId": null,
  "permissions": null,
} satisfies TaskDetailResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TaskDetailResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


