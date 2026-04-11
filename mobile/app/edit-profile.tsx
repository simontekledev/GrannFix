import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { useUser } from "@/src/context/UserContext";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { formStyles } from "@/src/styles/form";
import { STOCKHOLM_AREAS } from "@/src/helpers/areas";

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [loading, setLoading] = useState(!user);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState(user?.name ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [area, setArea] = useState(user?.area ?? "");
  const [street, setStreet] = useState(user?.street ?? "");
  const [city] = useState(user?.city ?? "Stockholm");

  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");

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
          email: email.trim(),
          city,
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

          <Text style={styles.label}>E-post <Text style={formStyles.required}>*</Text></Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            placeholder="din@email.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Stad</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledText}>{city}</Text>
          </View>

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
