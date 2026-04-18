import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

const BASE_URL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:8080";

export async function pickImage(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

export async function pickTaskImages(): Promise<string[]> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    return [];
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit: 5,
    quality: 0.8,
  });

  if (result.canceled || !result.assets) return [];
  return result.assets.map((a) => a.uri);
}

async function buildFormData(uri: string): Promise<FormData> {
  const formData = new FormData();

  if (Platform.OS === "web") {
    const response = await fetch(uri);
    const blob = await response.blob();
    const filename = uri.split("/").pop() ?? "photo.jpg";
    formData.append("file", blob, filename);
  } else {
    const filename = uri.split("/").pop() ?? "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";
    formData.append("file", {
      uri,
      name: filename,
      type,
    } as any);
  }

  return formData;
}

export async function uploadImage(uri: string): Promise<string | null> {
  const token = await AsyncStorage.getItem("access_token");
  if (!token) return null;

  const formData = await buildFormData(uri);

  const res = await fetch(`${BASE_URL}/files/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  const data = await res.json();
  return data.url as string;
}

export async function uploadProfileImage(uri: string): Promise<any> {
  const token = await AsyncStorage.getItem("access_token");
  if (!token) return null;

  const formData = await buildFormData(uri);

  const res = await fetch(`${BASE_URL}/users/me/profile-image`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
}
