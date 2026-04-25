# AdminReportControllerApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getReport**](AdminReportControllerApi.md#getreport) | **GET** /admin/reports/{id} |  |
| [**listReports**](AdminReportControllerApi.md#listreports) | **GET** /admin/reports |  |
| [**updateStatus**](AdminReportControllerApi.md#updatestatus) | **PATCH** /admin/reports/{id} |  |



## getReport

> AdminReportDto getReport(id)



### Example

```ts
import {
  Configuration,
  AdminReportControllerApi,
} from '';
import type { GetReportRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdminReportControllerApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetReportRequest;

  try {
    const data = await api.getReport(body);
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
| **id** | `string` |  | [Defaults to `undefined`] |

### Return type

[**AdminReportDto**](AdminReportDto.md)

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


## listReports

> PageAdminReportDto listReports(pageable, status)



### Example

```ts
import {
  Configuration,
  AdminReportControllerApi,
} from '';
import type { ListReportsRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdminReportControllerApi(config);

  const body = {
    // Pageable
    pageable: ...,
    // 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED' (optional)
    status: status_example,
  } satisfies ListReportsRequest;

  try {
    const data = await api.listReports(body);
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
| **pageable** | [](.md) |  | [Defaults to `undefined`] |
| **status** | `OPEN`, `INVESTIGATING`, `RESOLVED`, `DISMISSED` |  | [Optional] [Defaults to `undefined`] [Enum: OPEN, INVESTIGATING, RESOLVED, DISMISSED] |

### Return type

[**PageAdminReportDto**](PageAdminReportDto.md)

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


## updateStatus

> AdminReportDto updateStatus(id, updateReportStatusRequest)



### Example

```ts
import {
  Configuration,
  AdminReportControllerApi,
} from '';
import type { UpdateStatusRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AdminReportControllerApi(config);

  const body = {
    // string
    id: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // UpdateReportStatusRequest
    updateReportStatusRequest: ...,
  } satisfies UpdateStatusRequest;

  try {
    const data = await api.updateStatus(body);
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
| **id** | `string` |  | [Defaults to `undefined`] |
| **updateReportStatusRequest** | [UpdateReportStatusRequest](UpdateReportStatusRequest.md) |  | |

### Return type

[**AdminReportDto**](AdminReportDto.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `*/*`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

