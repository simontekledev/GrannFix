import { Configuration, Middleware, ResponseContext } from "./generated/runtime";
import { AuthControllerApi } from "./generated/apis/AuthControllerApi";
import { TaskControllerApi } from "./generated/apis/TaskControllerApi";
import { TaskQueryControllerApi } from "./generated/apis/TaskQueryControllerApi";
import { UserControllerApi } from "./generated/apis/UserControllerApi";
import { ChatControllerApi } from "./generated/apis/ChatControllerApi";
import { TaskOfferControllerApi } from "./generated/apis/TaskOfferControllerApi";
import { OfferControllerApi } from "./generated/apis/OfferControllerApi";
import { NotificationControllerApi } from "./generated/apis/NotificationControllerApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:8080";

let isRefreshing = false;

async function getToken() {
  return (await AsyncStorage.getItem("access_token")) ?? "";
}

const bareConfig = new Configuration({ basePath: BASE_URL });
const bareAuthApi = new AuthControllerApi(bareConfig);

async function tryRefreshToken(): Promise<boolean> {
  if (isRefreshing) return false;
  isRefreshing = true;
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (!refreshToken) return false;

    const data = await bareAuthApi.refresh({ refreshRequest: { refreshToken } });

    if (data.accessToken) {
      await AsyncStorage.setItem("access_token", data.accessToken);
    }
    if (data.refreshToken) {
      await AsyncStorage.setItem("refresh_token", data.refreshToken);
    }
    return true;
  } catch {
    return false;
  } finally {
    isRefreshing = false;
  }
}

const refreshMiddleware: Middleware = {
  async post(context: ResponseContext): Promise<Response | void> {
    if (context.response.status === 401) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        const newToken = await getToken();
        const retryResponse = await fetch(context.url, {
          ...context.init,
          headers: {
            ...context.init.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
        return retryResponse;
      }
    }
  },
};

const config = new Configuration({
  basePath: BASE_URL,
  accessToken: async () => await getToken(),
  middleware: [refreshMiddleware],
});

export const authApi = new AuthControllerApi(config);
export const taskApi = new TaskControllerApi(config);
export const taskQueryApi = new TaskQueryControllerApi(config);
export const userApi = new UserControllerApi(config);
export const chatApi = new ChatControllerApi(config);
export const taskOfferApi = new TaskOfferControllerApi(config);
export const offerApi = new OfferControllerApi(config);
export const notificationApi = new NotificationControllerApi(config);
