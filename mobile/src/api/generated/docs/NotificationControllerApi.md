# NotificationControllerApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**registerDevice**](NotificationControllerApi.md#registerdeviceoperation) | **PUT** /notifications/devices/{deviceId} |  |
| [**removeDevice**](NotificationControllerApi.md#removedevice) | **DELETE** /notifications/devices/{deviceId} |  |



## registerDevice

> registerDevice(deviceId, registerDeviceRequest)



### Example

```ts
import {
  Configuration,
  NotificationControllerApi,
} from '';
import type { RegisterDeviceOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationControllerApi(config);

  const body = {
    // string
    deviceId: deviceId_example,
    // RegisterDeviceRequest
    registerDeviceRequest: ...,
  } satisfies RegisterDeviceOperationRequest;

  try {
    const data = await api.registerDevice(body);
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
| **deviceId** | `string` |  | [Defaults to `undefined`] |
| **registerDeviceRequest** | [RegisterDeviceRequest](RegisterDeviceRequest.md) |  | |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: `application/json`
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)


## removeDevice

> removeDevice(deviceId)



### Example

```ts
import {
  Configuration,
  NotificationControllerApi,
} from '';
import type { RemoveDeviceRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new NotificationControllerApi(config);

  const body = {
    // string
    deviceId: deviceId_example,
  } satisfies RemoveDeviceRequest;

  try {
    const data = await api.removeDevice(body);
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
| **deviceId** | `string` |  | [Defaults to `undefined`] |

### Return type

`void` (Empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
| **200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

