import React, { useMemo, useState } from "react";
import { Alert, StyleSheet, TextInput, Pressable, ActivityIndicator, View, Modal, FlatList } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import ParallaxScrollView from "@/components/parallax-scroll-view";
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

  "Annat"
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

  const phoneDigits = phoneLocal.replace(/\D/g, "");
  const formattedPhone = phoneDigits.length > 0 ? `+46${phoneDigits}` : "";

  function formatPhoneDisplay(digits: string): string {
    // Format as 7X XXX XX XX
    let result = "";
    for (let i = 0; i < digits.length; i++) {
      if (i === 2 || i === 5 || i === 7) result += " ";
      result += digits[i];
    }
    return result;
  }

  const phoneDisplay = formatPhoneDisplay(phoneDigits);

  function handlePhoneChange(text: string) {
    // Strip leading zero (common mistake: typing 07... instead of 7...)
    const digits = text.replace(/\D/g, "").replace(/^0+/, "");
    setPhoneLocal(digits);
  }

  const canSubmit = useMemo(() => {
    return (
      !submitting &&
      email.trim().length > 0 &&
      password.length > 0 &&
      confirmPassword.length > 0 &&
      passwordsMatch &&
      name.trim().length > 0 &&
      phoneDigits.length >= 7 &&
      phoneDigits.length <= 10 &&
      area.trim().length > 0
    );
  }, [email, password, confirmPassword, passwordsMatch, name, phoneDigits, area, submitting]);

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

      Alert.alert("✅ Account created", "You’re registered and ready to go.");
      router.replace("/(tabs)/explore");
    } catch (e: any) {
      console.log("Register error:", e);

      const msg =
        e?.response?.status
          ? `HTTP ${e.response.status}`
          : e?.status
          ? `HTTP ${e.status}`
          : String(e?.message ?? e);

      Alert.alert("❌ Registration failed", msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ParallaxScrollView headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Create account</ThemedText>

        <ThemedView style={styles.form}>
          <ThemedText type="subtitle">Name</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor="#999"
            style={styles.input}
            editable={!submitting}
          />

          <ThemedText type="subtitle">Email</ThemedText>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="you@example.com"
            placeholderTextColor="#999"
            style={styles.input}
            editable={!submitting}
          />

          <ThemedText type="subtitle">Password</ThemedText>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#999"
            style={styles.input}
            editable={!submitting}
          />

          <ThemedText type="subtitle">Confirm password</ThemedText>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="#999"
            style={styles.input}
            editable={!submitting}
          />

          {confirmPassword.length > 0 ? (
            passwordsMatch ? (
              <ThemedText style={styles.successText}>✓ Passwords match</ThemedText>
            ) : (
              <ThemedText style={styles.errorText}>Passwords do not match</ThemedText>
            )
          ) : null}

          <ThemedText type="subtitle">Phone number</ThemedText>
          <View style={styles.phoneRow}>
            <View style={styles.phonePrefix}>
              <ThemedText style={styles.phonePrefixText}>+46</ThemedText>
            </View>
            <TextInput
              value={phoneDisplay}
              onChangeText={handlePhoneChange}
              keyboardType="number-pad"
              placeholder="7X XXX XX XX"
              placeholderTextColor="#999"
              style={[styles.input, styles.phoneInput]}
              editable={!submitting}
              maxLength={12}
            />
          </View>

          <ThemedText type="subtitle">City</ThemedText>
          <TextInput
            value="Stockholm"
            editable={false}
            style={[styles.input, styles.disabledInput]}
            placeholderTextColor="#999"
          />

          <ThemedText type="subtitle">Area</ThemedText>
          <Pressable
            onPress={() => !submitting && setAreaModalVisible(true)}
            style={styles.input}
          >
            <ThemedText style={area ? styles.areaSelectedText : styles.areaPlaceholderText}>
              {area || "Select area / district"}
            </ThemedText>
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
              <View style={styles.modalContent}>
                <ThemedText type="subtitle" style={styles.modalTitle}>
                  Select area
                </ThemedText>
                <TextInput
                  value={areaSearch}
                  onChangeText={setAreaSearch}
                  placeholder="Search..."
                  placeholderTextColor="#999"
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
                      <ThemedText style={styles.modalItemText}>{item}</ThemedText>
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
              <ActivityIndicator />
            ) : (
              <ThemedText style={styles.buttonText}>Register</ThemedText>
            )}
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.linkButton}>
            <ThemedText style={styles.linkText}>Already have an account? Back to login</ThemedText>
          </Pressable>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, marginBottom: 24 },
  form: { gap: 10, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#fff",
  },
  disabledInput: {
    opacity: 0.7,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  phonePrefix: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
  },
  phonePrefixText: {
    fontSize: 16,
    fontWeight: "600",
  },
  phoneInput: {
    flex: 1,
  },
  button: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonDisabled: { opacity: 0.45 },
  buttonPressed: { opacity: 0.8 },
  buttonText: { fontSize: 16 },
  linkButton: { marginTop: 12, alignItems: "center" },
  linkText: { textDecorationLine: "underline", opacity: 0.9 },
  errorText: {
    color: "#ff6b6b",
    marginTop: -4,
    marginBottom: 4,
  },
  successText: {
    color: "#4ade80",
    marginTop: -4,
    marginBottom: 4,
  },
  areaSelectedText: {
    fontSize: 16,
    color: "#fff",
  },
  areaPlaceholderText: {
    fontSize: 16,
    color: "#999",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1c1c1e",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "60%",
    paddingBottom: 32,
  },
  modalTitle: {
    textAlign: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#fff",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  modalItemSelected: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  modalItemPressed: {
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  modalItemText: {
    fontSize: 16,
    color: "#fff",
  },
});