
# TaskSummary


## Properties

Name | Type
------------ | -------------
`id` | string
`title` | string
`category` | string
`area` | string
`status` | string
`createdByName` | string
`createdByProfileImageUrl` | string

## Example

```typescript
import type { TaskSummary } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "title": null,
  "category": null,
  "area": null,
  "status": null,
  "createdByName": null,
  "createdByProfileImageUrl": null,
} satisfies TaskSummary

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as TaskSummary
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


