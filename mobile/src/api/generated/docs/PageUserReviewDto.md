
# PageUserReviewDto


## Properties

Name | Type
------------ | -------------
`totalElements` | number
`totalPages` | number
`size` | number
`content` | [Array&lt;UserReviewDto&gt;](UserReviewDto.md)
`number` | number
`sort` | [SortObject](SortObject.md)
`numberOfElements` | number
`first` | boolean
`last` | boolean
`pageable` | [PageableObject](PageableObject.md)
`empty` | boolean

## Example

```typescript
import type { PageUserReviewDto } from ''

// TODO: Update the object below with actual values
const example = {
  "totalElements": null,
  "totalPages": null,
  "size": null,
  "content": null,
  "number": null,
  "sort": null,
  "numberOfElements": null,
  "first": null,
  "last": null,
  "pageable": null,
  "empty": null,
} satisfies PageUserReviewDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PageUserReviewDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


