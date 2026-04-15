# OfferControllerApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**acceptOffer**](OfferControllerApi.md#acceptoffer) | **POST** /offers/{offerId}/accept |  |
| [**cancelOffer**](OfferControllerApi.md#canceloffer) | **POST** /offers/{offerId}/cancel |  |
| [**confirmDoneOffer**](OfferControllerApi.md#confirmdoneoffer) | **POST** /offers/{offerId}/confirm-done |  |
| [**markDoneOffer**](OfferControllerApi.md#markdoneoffer) | **POST** /offers/{offerId}/mark-done |  |
| [**rateHelper**](OfferControllerApi.md#ratehelperoperation) | **POST** /offers/{offerId}/rate |  |



## acceptOffer

> OfferResponse acceptOffer(offerId)



### Example

```ts
import {
  Configuration,
  OfferControllerApi,
} from '';
import type { AcceptOfferRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new OfferControllerApi(config);

  const body = {
    // string
    offerId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies AcceptOfferRequest;

  try {
    const data = await api.acceptOffer(body);
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
| **offerId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**OfferResponse**](OfferResponse.md)

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


## cancelOffer

> OfferResponse cancelOffer(offerId)



### Example

```ts
import {
  Configuration,
  OfferControllerApi,
} from '';
import type { CancelOfferRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new OfferControllerApi(config);

  const body = {
    // string
    offerId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies CancelOfferRequest;

  try {
    const data = await api.cancelOffer(body);
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
| **offerId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**OfferResponse**](OfferResponse.md)

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


## confirmDoneOffer

> OfferResponse confirmDoneOffer(offerId)



### Example

```ts
import {
  Configuration,
  OfferControllerApi,
} from '';
import type { ConfirmDoneOfferRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new OfferControllerApi(config);

  const body = {
    // string
    offerId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies ConfirmDoneOfferRequest;

  try {
    const data = await api.confirmDoneOffer(body);
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
| **offerId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**OfferResponse**](OfferResponse.md)

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


## markDoneOffer

> OfferResponse markDoneOffer(offerId)



### Example

```ts
import {
  Configuration,
  OfferControllerApi,
} from '';
import type { MarkDoneOfferRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new OfferControllerApi(config);

  const body = {
    // string
    offerId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies MarkDoneOfferRequest;

  try {
    const data = await api.markDoneOffer(body);
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
| **offerId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**OfferResponse**](OfferResponse.md)

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


## rateHelper

> OfferResponse rateHelper(offerId, rateHelperRequest)



### Example

```ts
import {
  Configuration,
  OfferControllerApi,
} from '';
import type { RateHelperOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new OfferControllerApi(config);

  const body = {
    // string
    offerId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // RateHelperRequest
    rateHelperRequest: ...,
  } satisfies RateHelperOperationRequest;

  try {
    const data = await api.rateHelper(body);
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
| **offerId** | `string` |  | [Defaults to `undefined`] |
| **rateHelperRequest** | [RateHelperRequest](RateHelperRequest.md) |  | |

### Return type

[**OfferResponse**](OfferResponse.md)

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

