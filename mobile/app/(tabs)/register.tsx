import React, { useMemo, useState } from "react";
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
import { authApi } from "@/src/api/client";

const STOCKHOLM_AREAS = [
  "Södermalm",
  "Östermalm",
  "Norrmalm",
  "Kungsholmen",
  "Vasastan",
  "Gamla Stan",

  "Bromma",
  "Vällingby",
  "Hässelby",
  "Spånga",
  "Kista",
  "Rinkeby",
  "Tensta",

  "Hägersten",
  "Liljeholmen",
  "Aspudden",
  "Midsommarkransen",
  "Älvsjö",
  "Enskede",
  "Årsta",
  "Farsta",
  "Skarpnäck",
  "Skärholmen",

  "Annat",
];

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [area, setArea] = useState("");
  const [areaModalVisible, setAreaModalVisible] = useState(false);
  const [areaSearch, setAreaSearch] = useState("");

  const filteredAreas = STOCKHOLM_AREAS.filter((a) =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const [submitting, setSubmitting] = useState(false);

  const passwordsMatch = password === confirmPassword;

  const BLOCKED_PASSWORDS = [
    "12345678", "123456789", "1234567890", "password", "password1",
    "qwerty123", "qwertyui", "abcdefgh", "abcd1234", "iloveyou",
    "letmein1", "welcome1", "monkey123", "dragon12", "master12",
    "football", "baseball", "trustno1", "sunshine", "princess",
    "11111111", "00000000", "12341234", "aaaaaaaa", "passw0rd",
  ];

  function validatePassword(pw: string): string | null {
    const lower = pw.toLowerCase();

    if (pw.length < 8) return "Lösenordet måste vara minst 8 tecken";
    if (pw.length > 64) return "Lösenordet får vara max 64 tecken";
    if (BLOCKED_PASSWORDS.includes(lower) || /^password\d*$/.test(lower)){
      return "Lösenordet är för svagt";
    }

    if (/^\d+$/.test(pw)) {
      return "Lösenordet får inte bara innehålla siffror";
    }

    if (/(.)\1{5,}/.test(pw)) {
      return "Lösenordet är för enkelt";
    }

    return null;
  }

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
    const digits = text.replace(/\D/g, "").replace(/^0+/, "");
    setPhoneLocal(digits);
  }

  const canSubmit = useMemo(() => {
    return (
      !submitting &&
      email.trim().length > 0 &&
      password.length >= 8 &&
      passwordError === null &&
      confirmPassword.length > 0 &&
      passwordsMatch &&
      name.trim().length > 0 &&
      phoneDigits.length >= 7 &&
      phoneDigits.length <= 10 &&
      area.trim().length > 0
    );
  }, [email, password, passwordError, confirmPassword, passwordsMatch, name, phoneDigits, area, submitting]);

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

      Alert.alert("Konto skapat", "Du är registrerad och redo att börja.");
      router.replace("/(tabs)/activity");
    } catch (e: any) {
      console.log("Register error:", e);

      const msg =
        e?.response?.status
          ? `HTTP ${e.response.status}`
          : e?.status
          ? `HTTP ${e.status}`
          : String(e?.message ?? e);

      Alert.alert("Registrering misslyckades", msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
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
            placeholderTextColor="#a0a0a0"
            style={styles.input}
            editable={!submitting}
          />

          <Text style={styles.label}>E-post</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="din@email.com"
            placeholderTextColor="#a0a0a0"
            style={styles.input}
            editable={!submitting}
          />

          <Text style={styles.label}>Lösenord</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Minst 8 tecken"
            placeholderTextColor="#a0a0a0"
            style={styles.input}
            editable={!submitting}
            maxLength={64}
          />
          {passwordError && (
            <Text style={styles.errorText}>{passwordError}</Text>
          )}

          <Text style={styles.label}>Bekräfta lösenord</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="Skriv lösenordet igen"
            placeholderTextColor="#a0a0a0"
            style={styles.input}
            editable={!submitting}
          />

          {confirmPassword.length > 0 ? (
            passwordsMatch ? (
              <Text style={styles.successText}>Lösenorden matchar</Text>
            ) : (
              <Text style={styles.errorText}>Lösenorden matchar inte</Text>
            )
          ) : null}

          <Text style={styles.label}>Telefonnummer</Text>
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}>
              <Text style={styles.phonePrefixText}>🇸🇪 +46</Text>
            </View>
            <TextInput
              value={phoneDisplay}
              onChangeText={handlePhoneChange}
              keyboardType="number-pad"
              placeholder="7X XXX XX XX"
              placeholderTextColor="#a0a0a0"
              style={[styles.input, styles.phoneInput]}
              editable={!submitting}
              maxLength={12}
            />
          </View>

          <Text style={styles.label}>Stad</Text>
          <View style={[styles.input, styles.disabledInput]}>
            <Text style={styles.disabledText}>Stockholm</Text>
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
            <Pressable
              style={styles.modalOverlay}
              onPress={() => { setAreaModalVisible(false); setAreaSearch(""); }}
            >
              <View
                style={styles.modalContent}
                onStartShouldSetResponder={() => true}
              >
                <Text style={styles.modalTitle}>Välj område</Text>
                <View style={styles.modalHandle} />
                <TextInput
                  value={areaSearch}
                  onChangeText={setAreaSearch}
                  placeholder="Sök..."
                  placeholderTextColor="#a0a0a0"
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

          <Pressable onPress={() => router.replace("/(tabs)/profile")} style={styles.linkButton}>
            <Text style={styles.linkText}>
              Har du redan ett konto? <Text style={styles.linkTextBold}>Logga in</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111",
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  disabledInput: {
    backgroundColor: "#efefef",
  },
  disabledText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  phonePrefix: {
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  phonePrefixText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  phoneInput: {
    flex: 1,
  },
  button: {
    marginTop: 28,
    backgroundColor: "#16A34A",
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
    color: "#666",
  },
  linkTextBold: {
    fontWeight: "600",
    color: "#16A34A",
  },
  errorText: {
    color: "#e53e3e",
    fontSize: 13,
    marginTop: 4,
  },
  successText: {
    color: "#16A34A",
    fontSize: 13,
    marginTop: 4,
  },
  areaSelectedText: {
    fontSize: 16,
    color: "#111",
  },
  areaPlaceholderText: {
    fontSize: 16,
    color: "#a0a0a0",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "60%",
    paddingBottom: 32,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    position: "absolute",
    top: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111",
    textAlign: "center",
    paddingTop: 20,
    paddingBottom: 12,
  },
  searchInput: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111",
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e8e8e8",
  },
  modalItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  modalItemSelected: {
    backgroundColor: "#f0fdf4",
  },
  modalItemPressed: {
    backgroundColor: "#f5f5f5",
  },
  modalItemText: {
    fontSize: 16,
    color: "#111",
  },
  modalCheck: {
    fontSize: 16,
    color: "#16A34A",
    fontWeight: "600",
  },
});
