import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";

const SECTIONS = [
  {
    title: "Personuppgiftsansvarig",
    body: "Grannfix är personuppgiftsansvarig för behandlingen av dina personuppgifter enligt denna policy. Kontaktuppgifter: support@grannfix.se.",
  },
  {
    title: "Vilken data vi samlar in",
    body: "Identitetsuppgifter: namn, e-postadress, telefonnummer.\n\nProfildata: profilbild, kort beskrivning (bio), stad och område.\n\nIdentitetsverifiering: när du verifierar dig via BankID bekräftar vi ditt namn och att din identitet är verifierad. Vi lagrar inte ditt personnummer.\n\nAnvändargenererat innehåll: uppdrag du skapar (titel, beskrivning, bilder, plats), erbjudanden du skickar, chattmeddelanden, recensioner och betyg.\n\nTeknisk data: enhets-token för push-notifikationer, IP-adress vid inloggning (för bedrägeriskydd) och loggar.",
  },
  {
    title: "Varför vi behandlar din data (rättslig grund)",
    body: "Avtal (GDPR art. 6.1.b): för att leverera tjänsten, det vill säga skapa konto, matcha uppdrag och möjliggöra chat och betalning mellan användare.\n\nBerättigat intresse (art. 6.1.f): för bedrägeriskydd, moderation, säkerhetsloggar och att förbättra appen.\n\nRättslig förpliktelse (art. 6.1.c): för bokföringskrav om transaktioner hanteras via plattformen, samt vid förfrågan från myndighet.\n\nSamtycke (art. 6.1.a): för push-notifikationer och frivilliga funktioner. Du kan när som helst återkalla samtycke i Inställningar.",
  },
  {
    title: "Vem vi delar din data med",
    body: "Vi säljer aldrig din data. Vi använder följande personuppgiftsbiträden för att driva tjänsten:\n\n• Microsoft Azure (Sverige): hosting av backend och databas\n• Cloudinary (EU): bildlagring och leverans\n• Google Firebase Cloud Messaging: push-notifikationer\n• Resend: utskick av transaktionella mejl\n• Criipto: identitetsverifiering via BankID\n\nNamn och profilbild på dig syns för andra användare när du skapar uppdrag, skickar erbjudanden eller får recensioner. Telefonnummer delas endast med uppdragsskaparen när du accepterat ett erbjudande, för att möjliggöra betalning via Swish.\n\nVi lämnar ut data till myndighet om vi är rättsligt skyldiga.",
  },
  {
    title: "Var din data lagras",
    body: "Din data lagras primärt inom EU/EES. För push-notifikationer används Google Firebase, som kan innebära överföring till USA. Google har Standard Contractual Clauses (SCC) på plats för detta enligt GDPR.",
  },
  {
    title: "Hur länge vi sparar din data",
    body: "Aktivt konto: så länge du använder tjänsten.\n\nVid radering: personuppgifter raderas inom 30 dagar. Namn och profil i recensioner du skrivit pseudonymiseras (visas som \"Borttagen användare\") för att bevara andra användares omdömeshistorik.\n\nChattmeddelanden: raderas när båda parter har raderat sina konton, eller efter 24 månaders inaktivitet.\n\nSäkerhets- och inloggningsloggar: 90 dagar.\n\nBokföringsuppgifter (om transaktioner förmedlats via oss): 7 år enligt bokföringslagen.",
  },
  {
    title: "Dina rättigheter",
    body: "Enligt GDPR har du rätt att:\n\n• Få tillgång till dina personuppgifter (registerutdrag)\n• Rätta felaktiga uppgifter, vilket du gör direkt under Redigera profil\n• Radera ditt konto och tillhörande data, vilket du gör under Inställningar\n• Exportera din data i maskinläsbart format\n• Invända mot behandling som sker på berättigat intresse\n• Begära begränsning av behandling\n• Återkalla samtycke för push-notifikationer och liknande\n\nKontakta support@grannfix.se för att utöva rättigheter som inte kan hanteras direkt i appen.",
  },
  {
    title: "Säkerhet",
    body: "Vi skyddar din data med kryptering vid överföring (HTTPS/TLS) och vid lagring där det är tillämpligt. Lösenord lagras endast som bcrypt-hashar. All åtkomst till produktionsdata är loggat och begränsat till personal som behöver det.\n\nVid en personuppgiftsincident som riskerar dina rättigheter informerar vi dig och Integritetsskyddsmyndigheten enligt GDPR.",
  },
  {
    title: "Åldersgräns",
    body: "Grannfix riktar sig till personer som har fyllt 18 år. Vi samlar inte medvetet in data från barn. Om du tror att ett konto tillhör någon under 18 år, kontakta oss på support@grannfix.se så raderar vi kontot.",
  },
  {
    title: "Ändringar av policyn",
    body: "Vi kan uppdatera denna policy. Vid väsentliga ändringar meddelas du via appen eller mejl innan de träder i kraft. Datumet längst upp visar när policyn senast uppdaterades.",
  },
  {
    title: "Klagomål till tillsynsmyndighet",
    body: "Om du anser att vi hanterar dina personuppgifter felaktigt har du rätt att lämna in klagomål till Integritetsskyddsmyndigheten (IMY), Box 8114, 104 20 Stockholm, imy@imy.se. Vi uppskattar dock om du först kontaktar oss så vi får möjlighet att rätta till saken.",
  },
  {
    title: "Kontakt",
    body: "Har du frågor om hur vi hanterar din data? Kontakta oss på support@grannfix.se.",
  },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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
        <Text style={styles.updated}>Senast uppdaterad: maj 2026</Text>
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
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
      color: colors.accent,
      fontWeight: "600",
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    updated: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 4,
    },
    scroll: {
      paddingHorizontal: 24,
      paddingBottom: 48,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 18,
      marginBottom: 12,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.textPrimary,
      marginBottom: 8,
    },
    cardBody: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 22,
    },
  });
}
