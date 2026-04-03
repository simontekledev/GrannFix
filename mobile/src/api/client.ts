import { Configuration } from "./generated/runtime";
import { AuthControllerApi } from "./generated/apis/AuthControllerApi";
import { TaskControllerApi } from "./generated/apis/TaskControllerApi";
import { TaskQueryControllerApi } from "./generated/apis/TaskQueryControllerApi";
import { UserControllerApi } from "./generated/apis/UserControllerApi";
import { ChatControllerApi } from "./generated/apis/ChatControllerApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "http://192.168.1.164:8080"; 

async function getToken() {
  return (await AsyncStorage.getItem("access_token")) ?? "";
}

const config = new Configuration({
  basePath: BASE_URL,
  accessToken: async () => await getToken(),
});

console.log("API BASE URL:", BASE_URL);

export const authApi = new AuthControllerApi(config);
export const taskApi = new TaskControllerApi(config);
export const taskQueryApi = new TaskQueryControllerApi(config);
export const userApi = new UserControllerApi(config);
export const chatApi = new ChatControllerApi(config);