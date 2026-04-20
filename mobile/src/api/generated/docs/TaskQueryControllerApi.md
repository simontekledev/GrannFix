# TaskQueryControllerApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**listTasks**](TaskQueryControllerApi.md#listtasks) | **GET** /tasks |  |



## listTasks

> CursorPageResponseTaskResponse listTasks(cursor, limit, status, city, area, category, search)



### Example

```ts
import {
  Configuration,
  TaskQueryControllerApi,
} from '';
import type { ListTasksRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new TaskQueryControllerApi(config);

  const body = {
    // string (optional)
    cursor: cursor_example,
    // number (optional)
    limit: 56,
    // 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED' (optional)
    status: status_example,
    // string (optional)
    city: city_example,
    // string (optional)
    area: area_example,
    // string (optional)
    category: category_example,
    // string (optional)
    search: search_example,
  } satisfies ListTasksRequest;

  try {
    const data = await api.listTasks(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters


| Name | Type | Description  | Notes |
|------------- | ------------- | ------------- | -------------|
| **cursor** | `string` |  | [Optional] [Defaults to `undefined`] |
| **limit** | `number` |  | [Optional] [Defaults to `20`] |
| **status** | `OPEN`, `ASSIGNED`, `COMPLETED`, `CANCELLED` |  | [Optional] [Defaults to `undefined`] [Enum: OPEN, ASSIGNED, COMPLETED, CANCELLED] |
| **city** | `string` |  | [Optional] [Defaults to `undefined`] |
| **area** | `string` |  | [Optional] [Defaults to `undefined`] |
| **category** | `string` |  | [Optional] [Defaults to `undefined`] |
| **search** | `string` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**CursorPageResponseTaskResponse**](CursorPageResponseTaskResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `*/*`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

