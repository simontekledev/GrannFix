
# PublicUserDto


## Properties

Name | Type
------------ | -------------
`id` | string
`name` | string
`bio` | string
`city` | string
`area` | string
`ratingAverage` | number
`ratingCount` | number
`completedOffersCount` | number
`verified` | boolean

## Example

```typescript
import type { PublicUserDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "name": null,
  "bio": null,
  "city": null,
  "area": null,
  "ratingAverage": null,
  "ratingCount": null,
  "completedOffersCount": null,
  "verified": null,
} satisfies PublicUserDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PublicUserDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


