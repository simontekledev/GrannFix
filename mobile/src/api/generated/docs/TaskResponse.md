
# TaskResponse


## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`description` | string
`category` | string
`urgency` | string
`city` | string
`area` | string
`street` | string
`offeredPrice` | number
`status` | string
`createdById` | string
`active` | boolean
`createdAt` | Date
`updatedAt` | Date
`completedAt` | Date
`pendingOffersCount` | number

## Example

```typescript
import type { TaskResponse } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "title": null,
  "description": null,
  "category": null,
  "urgency": null,
  "city": null,
  "area": null,
  "street": null,
  "offeredPrice": null,
  "status": null,
  "createdById": null,
  "active": null,
  "createdAt": null,
  "updatedAt": null,
  "completedAt": null,
  "pendingOffersCount": null,
} satisfies TaskResponse

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TaskResponse
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


