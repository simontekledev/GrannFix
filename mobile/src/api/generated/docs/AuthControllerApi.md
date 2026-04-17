# AuthControllerApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**forgotPassword**](AuthControllerApi.md#forgotpasswordoperation) | **POST** /auth/forgot-password |  |
| [**login**](AuthControllerApi.md#loginoperation) | **POST** /auth/login |  |
| [**refresh**](AuthControllerApi.md#refreshoperation) | **POST** /auth/refresh |  |
| [**register**](AuthControllerApi.md#registeroperation) | **POST** /auth/register |  |
| [**resetPassword**](AuthControllerApi.md#resetpasswordoperation) | **POST** /auth/reset-password |  |
| [**sendOtp**](AuthControllerApi.md#sendotp) | **POST** /auth/send-otp |  |
| [**verifyOtp**](AuthControllerApi.md#verifyotpoperation) | **POST** /auth/verify-otp |  |



## forgotPassword

> forgotPassword(forgotPasswordRequest)



### Example

```ts
import {
  Configuration,
  AuthControllerApi,
} from '';
import type { ForgotPasswordOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AuthControllerApi(config);

  const body = {
    // ForgotPasswordRequest
    forgotPasswordRequest: ...,
  } satisfies ForgotPasswordOperationRequest;

  try {
    const data = await api.forgotPassword(body);
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
| **forgotPasswordRequest** | [ForgotPasswordRequest](ForgotPasswordRequest.md) |  | |

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


## login

> AuthResponse login(loginRequest)



### Example

```ts
import {
  Configuration,
  AuthControllerApi,
} from '';
import type { LoginOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AuthControllerApi(config);

  const body = {
    // LoginRequest
    loginRequest: ...,
  } satisfies LoginOperationRequest;

  try {
    const data = await api.login(body);
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
| **loginRequest** | [LoginRequest](LoginRequest.md) |  | |

### Return type

[**AuthResponse**](AuthResponse.md)

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


## refresh

> AuthResponse refresh(refreshRequest)



### Example

```ts
import {
  Configuration,
  AuthControllerApi,
} from '';
import type { RefreshOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AuthControllerApi(config);

  const body = {
    // RefreshRequest
    refreshRequest: ...,
  } satisfies RefreshOperationRequest;

  try {
    const data = await api.refresh(body);
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
| **refreshRequest** | [RefreshRequest](RefreshRequest.md) |  | |

### Return type

[**AuthResponse**](AuthResponse.md)

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


## register

> AuthResponse register(registerRequest)



### Example

```ts
import {
  Configuration,
  AuthControllerApi,
} from '';
import type { RegisterOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AuthControllerApi(config);

  const body = {
    // RegisterRequest
    registerRequest: ...,
  } satisfies RegisterOperationRequest;

  try {
    const data = await api.register(body);
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
| **registerRequest** | [RegisterRequest](RegisterRequest.md) |  | |

### Return type

[**AuthResponse**](AuthResponse.md)

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


## resetPassword

> resetPassword(resetPasswordRequest)



### Example

```ts
import {
  Configuration,
  AuthControllerApi,
} from '';
import type { ResetPasswordOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AuthControllerApi(config);

  const body = {
    // ResetPasswordRequest
    resetPasswordRequest: ...,
  } satisfies ResetPasswordOperationRequest;

  try {
    const data = await api.resetPassword(body);
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
| **resetPasswordRequest** | [ResetPasswordRequest](ResetPasswordRequest.md) |  | |

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


## sendOtp

> string sendOtp(phoneNumber)



### Example

```ts
import {
  Configuration,
  AuthControllerApi,
} from '';
import type { SendOtpRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AuthControllerApi(config);

  const body = {
    // string
    phoneNumber: phoneNumber_example,
  } satisfies SendOtpRequest;

  try {
    const data = await api.sendOtp(body);
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
| **phoneNumber** | `string` |  | [Defaults to `undefined`] |

### Return type

**string**

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


## verifyOtp

> AuthResponse verifyOtp(verifyOtpRequest)



### Example

```ts
import {
  Configuration,
  AuthControllerApi,
} from '';
import type { VerifyOtpOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new AuthControllerApi(config);

  const body = {
    // VerifyOtpRequest
    verifyOtpRequest: ...,
  } satisfies VerifyOtpOperationRequest;

  try {
    const data = await api.verifyOtp(body);
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
| **verifyOtpRequest** | [VerifyOtpRequest](VerifyOtpRequest.md) |  | |

### Return type

[**AuthResponse**](AuthResponse.md)

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

