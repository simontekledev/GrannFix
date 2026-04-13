
# CreateTaskRequest


## Properties

Name | Type
------------ | -------------
`title` | string
`description` | string
`category` | string
`city` | string
`area` | string
`street` | string
`offeredPrice` | number

## Example

```typescript
import type { CreateTaskRequest } from ''

// TODO: Update the object below with actual values
const example = {
  "title": null,
  "description": null,
  "category": null,
  "city": null,
  "area": null,
  "street": null,
  "offeredPrice": null,
} satisfies CreateTaskRequest

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as CreateTaskRequest
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


