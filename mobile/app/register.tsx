import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  View,
  Text,
  Modal,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { authApi } from "@/src/api/client";
import { validatePassword } from "@/src/helpers/password";
import { STOCKHOLM_AREAS } from "@/src/helpers/areas";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { useUser } from "@/src/context/UserContext";

export default function RegisterScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { loadProfile } = useUser();

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [area, setArea] = useState("");
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const filteredAreas = STOCKHOLM_AREAS.filter((a) =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const [submitting, setSubmitting] = useState(false);

  const passwordError = password.length > 0 ? validatePassword(password) : null;

  const phoneDigits = phoneLocal.replace(/\D/g, "");
  const formattedPhone = phoneDigits.length > 0 ? `+46${phoneDigits}` : "";

  function formatPhoneDisplay(digits: string): string {
    let result = "";
    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 5 || i === 7) result += " ";
      result += digits[i];
    }
    return result;
  }

  const phoneDisplay = formatPhoneDisplay(phoneDigits);

  function handlePhoneChange(text: string) {
    let digits = text.replace(/\D/g, "").replace(/^0+/, "");
    if (digits.length > 0 && digits[0] !== "7") {
      digits = "";
    }
    setPhoneLocal(digits);
  }

  const canSubmit = useMemo(() => {
    return (
      !submitting &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      passwordError === null &&
      name.trim().length > 0 &&
      phoneDigits.length >= 7 &&
      phoneDigits.length <= 10 &&
      area.trim().length > 0
    );
  }, [email, password, passwordError, name, phoneDigits, area, submitting]);

  async function handleRegister() {
    if (!canSubmit) return;

    setSubmitting(true);
    try {
      const res = await authApi.register({
        registerRequest: {
          email: email.trim(),
          password,
          name: name.trim(),
          phoneNumber: formattedPhone,
          city: "Stockholm",
          area: area.trim(),
        },
      });

      if (res?.accessToken) {
        await AsyncStorage.setItem("access_token", res.accessToken);
      }
      if (res?.refreshToken) {
        await AsyncStorage.setItem("refresh_token", res.refreshToken);
      }

      await loadProfile();
      Alert.alert("Konto skapat", "Du är registrerad och redo att börja.");
      router.replace("/(tabs)/tasks");
    } catch (e: any) {
      console.log("Register error:", e);

      let msg = "Något gick fel. Försök igen.";
      const status = e?.response?.status ?? e?.status;
      if (status === 409 || status === 400) {
        msg = "E-postadressen är redan registrerad. Prova att logga in istället.";
      } else if (status === 422) {
        msg = "Kontrollera att alla fält är korrekt ifyllda.";
      } else if (status === 429) {
        msg = "För många försök. Vänta en stund och försök igen.";
      } else if (!status) {
        msg = "Kunde inte nå servern. Kontrollera din internetanslutning.";
      }

      if (Platform.OS === "web") {
        window.alert(msg);
      } else {
        Alert.alert("Registrering misslyckades", msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Skapa konto</Text>
          <Text style={styles.subtitle}>Fyll i dina uppgifter för att komma igång</Text>

          <Text style={styles.label}>Fullständigt namn</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ange ditt fullständiga namn"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            editable={!submitting}
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />

          <Text style={styles.label}>E-post</Text>
          <TextInput
            ref={emailRef}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="din@email.com"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            editable={!submitting}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
          />

          <Text style={styles.label}>Lösenord</Text>
          <View style={styles.passwordRow}>
            <TextInput
              ref={passwordRef}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="Minst 8 tecken"
              placeholderTextColor={colors.textMuted}
              style={styles.passwordInput}
              editable={!submitting}
              maxLength={64}
              returnKeyType="next"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
            <Pressable
              onPress={() => setShowPassword((s) => !s)}
              hitSlop={8}
              style={styles.eyeButton}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Dölj lösenord" : "Visa lösenord"}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={colors.textMuted}
              />
            </Pressable>
          </View>
          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          <Text style={styles.label}>Telefonnummer</Text>
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>+46</Text>
            </View>
            <TextInput
              ref={phoneRef}
              value={phoneDisplay}
              onChangeText={handlePhoneChange}
              keyboardType="number-pad"
              placeholder="7X XXX XX XX"
              placeholderTextColor={colors.textMuted}
              style={[styles.input, styles.phoneInput]}
              editable={!submitting}
              maxLength={12}
              returnKeyType="done"
            />
          </View>

          <Text style={styles.label}>Område</Text>
          <Pressable
            onPress={() => !submitting && setAreaModalVisible(true)}
            style={styles.input}
          >
            <Text style={area ? styles.areaSelectedText : styles.areaPlaceholderText}>
              {area || "Välj område"}
            </Text>
          </Pressable>

          <Modal
            visible={areaModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => { setAreaModalVisible(false); setAreaSearch(""); }}
          >
            <View style={styles.modalOverlay}>
              <Pressable
                style={{ flex: 1 }}
                onPress={() => { setAreaModalVisible(false); setAreaSearch(""); }}
              />
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Välj område</Text>
                <View style={styles.modalHandle} />
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
            </View>
          </Modal>

          <Pressable
            onPress={handleRegister}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.button,
              !canSubmit && styles.buttonDisabled,
              pressed && canSubmit && styles.buttonPressed,
            ]}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Registrera</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.linkButton}>
            <Text style={styles.linkText}>
              Har du redan ett konto? <Text style={styles.linkTextBold}>Logga in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingTop: 24,
      paddingBottom: 48,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 24,
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
    passwordRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingRight: 8,
    },
    passwordInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.textPrimary,
    },
    eyeButton: {
      padding: 8,
    },
    phoneRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    phonePrefix: {
      backgroundColor: colors.card,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    phonePrefixText: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.textPrimary,
    },
    phoneInput: {
      flex: 1,
    },
    button: {
      marginTop: 28,
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonDisabled: { opacity: 0.35 },
    buttonPressed: { opacity: 0.8 },
    buttonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#fff",
    },
    linkButton: {
      marginTop: 16,
      alignItems: "center",
    },
    linkText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    linkTextBold: {
      fontWeight: "600",
      color: colors.accent,
    },
    errorText: {
      color: colors.danger,
      fontSize: 13,
      marginTop: 4,
    },
    areaSelectedText: {
      fontSize: 16,
      color: colors.textPrimary,
    },
    areaPlaceholderText: {
      fontSize: 16,
      color: colors.textMuted,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
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
