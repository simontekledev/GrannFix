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
    title: "Allmänt",
    body: "Grannfix är en plattform som kopplar ihop människor som behöver hjälp med vardagssysslor och småfixar med personer i deras närområde som kan hjälpa till. Genom att använda appen godkänner du dessa villkor.",
  },
  {
    title: "Behörighet",
    body: "Du måste vara minst 18 år för att använda Grannfix. Du ansvarar för att dina kontouppgifter är korrekta och aktuella.",
  },
  {
    title: "Användaransvar",
    body: "Du ansvarar för allt innehåll du publicerar och alla överenskommelser du ingår med andra användare. Grannfix är en förmedlingsplattform och är inte part i avtal mellan användare.",
  },
  {
    title: "Förbjudet beteende",
    body: "Det är inte tillåtet att använda Grannfix för olagliga aktiviteter, publicera vilseledande information, trakassera andra användare eller försöka kringgå plattformens system. Missbruk kan leda till avstängning.",
  },
  {
    title: "Betalning",
    body: "Priser och ersättningar avtalas direkt mellan användare. Grannfix hanterar inga betalningar och tar inget ansvar för ekonomiska tvister mellan användare.",
  },
  {
    title: "Ansvarsbegränsning",
    body: "Grannfix tillhandahåller plattformen i befintligt skick. Vi garanterar inte tillgänglighet, kvalitet på utförda uppdrag eller andra användares beteende. Grannfix ansvarar inte för skador som uppstår mellan användare.",
  },
  {
    title: "Ändringar",
    body: "Vi kan uppdatera dessa villkor. Fortsatt användning av appen innebär att du godkänner de nya villkoren. Vid väsentliga ändringar kommer vi att meddela dig i appen.",
  },
  {
    title: "Kontakt",
    body: "Har du frågor om dessa villkor? Kontakta oss på support@grannfix.se.",
  },
];

export default function TermsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.replace("/(tabs)/about")}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backText}>← Om Grannfix</Text>
        </Pressable>
        <Text style={styles.title}>Användarvillkor</Text>
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
