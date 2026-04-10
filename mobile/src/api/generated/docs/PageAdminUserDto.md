
# PageAdminUserDto


## Properties

Name | Type
------------ | -------------
`totalPages` | number
`totalElements` | number
`numberOfElements` | number
`pageable` | [PageableObject](PageableObject.md)
`size` | number
`content` | [Array&lt;AdminUserDto&gt;](AdminUserDto.md)
`number` | number
`sort` | [SortObject](SortObject.md)
`first` | boolean
`last` | boolean
`empty` | boolean

## Example

```typescript
import type { PageAdminUserDto } from ''

// TODO: Update the object below with actual values
const example = {
  "totalPages": null,
  "totalElements": null,
  "numberOfElements": null,
  "pageable": null,
  "size": null,
  "content": null,
  "number": null,
  "sort": null,
  "first": null,
  "last": null,
  "empty": null,
} satisfies PageAdminUserDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as PageAdminUserDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


