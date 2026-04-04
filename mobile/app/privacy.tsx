import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

const SECTIONS = [
  {
    title: "Vilken data samlar vi in?",
    body: "När du skapar ett konto samlar vi in: namn, e-postadress, telefonnummer, stad och område. Vi sparar även uppgifter om uppdrag du skapar eller hjälper till med.",
  },
  {
    title: "Varför samlar vi in data?",
    body: "Vi använder din data för att:\n\n• Skapa och hantera ditt konto\n• Matcha dig med uppdrag i ditt närområde\n• Möjliggöra kontakt mellan användare\n• Förbättra appen och användarupplevelsen",
  },
  {
    title: "Hur länge sparar vi data?",
    body: "Vi sparar din data så länge du har ett aktivt konto. Om du raderar ditt konto tar vi bort all personlig data inom 30 dagar.",
  },
  {
    title: "Dina rättigheter",
    body: "Enligt GDPR har du rätt att:\n\n• Begära tillgång till din data\n• Korrigera felaktig data\n• Radera ditt konto och all tillhörande data\n• Exportera din data\n\nDu kan radera ditt konto direkt i appen via Inställningar.",
  },
  {
    title: "Delning med tredje part",
    body: "Vi säljer aldrig din data. Din information delas inte med tredje part förutom:\n\n• Tekniska tjänsteleverantörer som behövs för att driva appen (hosting, push-notifikationer)\n• Om det krävs enligt lag",
  },
  {
    title: "Säkerhet",
    body: "Vi skyddar din data med kryptering och säkra servrar. Lösenord lagras aldrig i klartext.",
  },
  {
    title: "Kontakt",
    body: "Har du frågor om hur vi hanterar din data? Kontakta oss på support@grannfix.se.",
  },
];

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backText}>← Om Grannfix</Text>
        </Pressable>
        <Text style={styles.title}>Integritetspolicy</Text>
        <Text style={styles.updated}>Senast uppdaterad: april 2026</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backText: {
    fontSize: 15,
    color: "#16A34A",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  updated: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111",
    marginBottom: 8,
  },
  cardBody: {
    fontSize: 14,
    color: "#555",
    lineHeight: 22,
  },
});
