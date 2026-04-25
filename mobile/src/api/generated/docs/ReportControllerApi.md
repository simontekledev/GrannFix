# ReportControllerApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**createReport**](ReportControllerApi.md#createreportoperation) | **POST** /reports |  |



## createReport

> ReportResponse createReport(createReportRequest)



### Example

```ts
import {
  Configuration,
  ReportControllerApi,
} from '';
import type { CreateReportOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ReportControllerApi(config);

  const body = {
    // CreateReportRequest
    createReportRequest: ...,
  } satisfies CreateReportOperationRequest;

  try {
    const data = await api.createReport(body);
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
| **createReportRequest** | [CreateReportRequest](CreateReportRequest.md) |  | |

### Return type

[**ReportResponse**](ReportResponse.md)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: `*/*`


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **201** | Created |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

