import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { userApi } from "@/src/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useUser } from "@/src/context/UserContext";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { createFormStyles } from "@/src/styles/form";
import { STOCKHOLM_AREAS } from "@/src/helpers/areas";
import { pickImage, uploadProfileImage, resolveImageUrl } from "@/src/helpers/images";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser, loadProfile } = useUser();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const formStyles = useMemo(() => createFormStyles(colors), [colors]);
  const [loading, setLoading] = useState(!user);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [area, setArea] = useState(user?.area ?? "");
  const [street, setStreet] = useState(user?.street ?? "");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");

  async function handleImagePress() {
    if (!user?.profileImageUrl) {
      doPickAndUpload();
      return;
    }
    if (Platform.OS === "web") {
      const choice = window.prompt("Skriv 'byt' för ny bild eller 'ta bort' för att ta bort");
      if (choice?.toLowerCase().startsWith("byt")) doPickAndUpload();
      else if (choice?.toLowerCase().startsWith("ta")) doDeleteImage();
      return;
    }
    Alert.alert("Profilbild", "Vad vill du göra?", [
      { text: "Avbryt", style: "cancel" },
      { text: "Byt bild", onPress: doPickAndUpload },
      { text: "Ta bort bild", style: "destructive", onPress: doDeleteImage },
    ]);
  }

  async function doPickAndUpload() {
    const uri = await pickImage();
    if (!uri) return;
    setUploadingImage(true);
    try {
      await uploadProfileImage(uri);
      await loadProfile();
    } catch (e) {
      console.log("Profile image upload error:", e);
      const msg = "Kunde inte ladda upp bilden.";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
    } finally {
      setUploadingImage(false);
    }
  }

  async function doDeleteImage() {
    setUploadingImage(true);
    try {
      const token = await AsyncStorage.getItem("access_token");
      const base = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:8080";
      await fetch(`${base}/users/me/profile-image`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      await loadProfile();
    } catch (e) {
      console.log("Delete profile image error:", e);
      const msg = "Kunde inte ta bort bilden.";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
    } finally {
      setUploadingImage(false);
    }
  }

  const filteredAreas = STOCKHOLM_AREAS.filter((a) =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  useEffect(() => {
    if (user) setLoading(false);
  }, [user]);

  async function handleSave() {
    if (!name.trim() || !area.trim()) return;
    setSubmitting(true);
    try {
      const updated = await userApi.updateMe({
        updateMeRequest: {
          name: name.trim(),
          bio: bio.trim(),
          city: user?.city ?? "Stockholm",
          area: area.trim(),
          street: street.trim(),
        },
      });
      setUser(updated);
      router.back();
    } catch (e: any) {
      console.log("Update error:", e);
      const msg = "Kunde inte uppdatera profilen. Försök igen.";
      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Fel", msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backText}>← Inställningar</Text>
        </Pressable>
        <Text style={styles.title}>Redigera profil</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable onPress={handleImagePress} style={styles.avatarWrapper}>
            {user?.profileImageUrl ? (
              <Image
                source={{ uri: resolveImageUrl(user.profileImageUrl)! }}
                style={styles.avatar}
              />
            ) : (
              <Image
                source={require("@/assets/images/user-profile1-icon.png")}
                style={styles.avatar}
              />
            )}
            {uploadingImage && (
              <View style={styles.avatarOverlay}>
                <ActivityIndicator color="#fff" />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Image
                source={require("@/assets/images/camera-icon.png")}
                style={styles.avatarBadgeIcon}
                resizeMode="contain"
              />
            </View>
          </Pressable>
          <Text style={styles.label}>Namn <Text style={formStyles.required}>*</Text></Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder="Ditt namn"
            placeholderTextColor={colors.textMuted}
          />

          <Text style={styles.label}>Bio <Text style={formStyles.optional}>(valfritt)</Text></Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            style={[styles.input, styles.bioInput]}
            placeholder="Berätta om dig själv"
            placeholderTextColor={colors.textMuted}
            multiline
          />

          <Text style={styles.label}>Område <Text style={formStyles.required}>*</Text></Text>
          <Pressable
            onPress={() => setAreaModalVisible(true)}
            style={styles.input}
          >
            <Text style={area ? styles.areaText : styles.areaPlaceholder}>
              {area || "Välj område"}
            </Text>
          </Pressable>

          <Text style={styles.label}>Adress <Text style={formStyles.optional}>(valfritt)</Text></Text>
          <TextInput
            value={street}
            onChangeText={setStreet}
            style={styles.input}
            placeholder="Gatuadress (valfritt)"
            placeholderTextColor={colors.textMuted}
          />

          <Pressable
            onPress={handleSave}
            disabled={submitting || !name.trim() || !area.trim()}
            style={({ pressed, hovered }: any) => [
              styles.saveButton,
              (!name.trim() || !area.trim()) && styles.saveButtonDisabled,
              hovered && styles.saveButtonHovered,
              pressed && styles.saveButtonPressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Spara ändringar</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={areaModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => { setAreaModalVisible(false); setAreaSearch(""); }}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => { setAreaModalVisible(false); setAreaSearch(""); }}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Välj område</Text>
            <TextInput
              value={areaSearch}
              onChangeText={setAreaSearch}
              placeholder="Sök..."
              placeholderTextColor={colors.textMuted}
              autoCorrect={false}
              style={styles.searchInput}
            />
            <FlatList
              data={filteredAreas}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setArea(item);
                    setAreaModalVisible(false);
                    setAreaSearch("");
                  }}
                  style={({ pressed }) => [
                    styles.modalItem,
                    item === area && styles.modalItemSelected,
                    pressed && styles.modalItemPressed,
                  ]}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {item === area && <Text style={styles.modalCheck}>✓</Text>}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    header: {
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 20,
    },
    backButton: {
      alignSelf: "flex-start",
      marginBottom: 12,
    },
    backText: {
      fontSize: 15,
      color: colors.accent,
      fontWeight: "600",
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingBottom: 48,
    },
    avatarWrapper: {
      alignSelf: "center",
      marginBottom: 16,
      marginTop: 8,
      position: "relative",
    },
    avatar: {
      width: 140,
      height: 140,
      borderRadius: 70,
    },
    avatarOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.4)",
      borderRadius: 70,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: colors.accentMuted,
      borderRadius: 18,
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: colors.background,
    },
    avatarBadgeIcon: {
      width: 18,
      height: 18,
      tintColor: colors.accent,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.textPrimary,
      marginBottom: 6,
      marginTop: 16,
    },
    input: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.textPrimary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bioInput: {
      minHeight: 80,
      textAlignVertical: "top",
    },
    disabledInput: {
      backgroundColor: colors.divider,
    },
    disabledText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textMuted,
    },
    areaText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    areaPlaceholder: {
      fontSize: 16,
      color: colors.textMuted,
    },
    saveButton: {
      marginTop: 28,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    saveButtonDisabled: {
      opacity: 0.35,
    },
    saveButtonHovered: {
      backgroundColor: colors.accent,
      opacity: 0.92,
      transform: [{ scale: 1.015 }],
    },
    saveButtonPressed: {
      opacity: 0.8,
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "60%",
      paddingBottom: 32,
    },
    modalHandle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: "center",
      position: "absolute",
      top: 8,
    },
    modalTitle: {
      fontSize: 17,
      fontWeight: "600",
      color: colors.textPrimary,
      textAlign: "center",
      paddingTop: 20,
      paddingBottom: 12,
    },
    searchInput: {
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.textPrimary,
      marginHorizontal: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modalItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.divider,
    },
    modalItemSelected: {
      backgroundColor: colors.accentMuted,
    },
    modalItemPressed: {
      backgroundColor: colors.divider,
    },
    modalItemText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    modalCheck: {
      fontSize: 16,
      color: colors.accent,
      fontWeight: "600",
    },
  });
}
