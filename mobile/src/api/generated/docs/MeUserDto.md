
# MeUserDto


## Properties

Name | Type
------------ | -------------
`id` | string
`phoneNumber` | string
`email` | string
`name` | string
`bio` | string
`city` | string
`area` | string
`street` | string
`verified` | boolean
`ratingAverage` | number
`ratingCount` | number
`createdAt` | Date

## Example

```typescript
import type { MeUserDto } from ''

// TODO: Update the object below with actual values
const example = {
  "id": null,
  "phoneNumber": null,
  "email": null,
  "name": null,
  "bio": null,
  "city": null,
  "area": null,
  "street": null,
  "verified": null,
  "ratingAverage": null,
  "ratingCount": null,
  "createdAt": null,
} satisfies MeUserDto

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as MeUserDto
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


