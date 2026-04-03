# ChatControllerApi

All URIs are relative to *http://localhost:8080*

| Method | HTTP request | Description |
|------------- | ------------- | -------------|
| [**getMessages**](ChatControllerApi.md#getmessages) | **GET** /chats/{chatId}/messages |  |
| [**getOrCreateChat**](ChatControllerApi.md#getorcreatechat) | **GET** /tasks/{taskId}/chat |  |
| [**sendMessage**](ChatControllerApi.md#sendmessageoperation) | **POST** /chats/{chatId}/messages |  |



## getMessages

> Array&lt;ChatMessageResponse&gt; getMessages(chatId, after)



### Example

```ts
import {
  Configuration,
  ChatControllerApi,
} from '';
import type { GetMessagesRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ChatControllerApi(config);

  const body = {
    // string
    chatId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // Date (optional)
    after: 2013-10-20T19:20:30+01:00,
  } satisfies GetMessagesRequest;

  try {
    const data = await api.getMessages(body);
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
| **chatId** | `string` |  | [Defaults to `undefined`] |
| **after** | `Date` |  | [Optional] [Defaults to `undefined`] |

### Return type

[**Array&lt;ChatMessageResponse&gt;**](ChatMessageResponse.md)

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


## getOrCreateChat

> ChatResponse getOrCreateChat(taskId)



### Example

```ts
import {
  Configuration,
  ChatControllerApi,
} from '';
import type { GetOrCreateChatRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ChatControllerApi(config);

  const body = {
    // string
    taskId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
  } satisfies GetOrCreateChatRequest;

  try {
    const data = await api.getOrCreateChat(body);
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
| **taskId** | `string` |  | [Defaults to `undefined`] |

### Return type

[**ChatResponse**](ChatResponse.md)

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


## sendMessage

> ChatMessageResponse sendMessage(chatId, sendMessageRequest)



### Example

```ts
import {
  Configuration,
  ChatControllerApi,
} from '';
import type { SendMessageOperationRequest } from '';

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({ 
    // Configure HTTP bearer authorization: bearerAuth
    accessToken: "YOUR BEARER TOKEN",
  });
  const api = new ChatControllerApi(config);

  const body = {
    // string
    chatId: 38400000-8cf0-11bd-b23e-10b96e4ef00d,
    // SendMessageRequest
    sendMessageRequest: ...,
  } satisfies SendMessageOperationRequest;

  try {
    const data = await api.sendMessage(body);
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
| **chatId** | `string` |  | [Defaults to `undefined`] |
| **sendMessageRequest** | [SendMessageRequest](SendMessageRequest.md) |  | |

### Return type

[**ChatMessageResponse**](ChatMessageResponse.md)

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

