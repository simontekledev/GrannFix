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
    title: "Allmänt",
    body: "Grannfix är en plattform som kopplar samman personer som behöver hjälp med vardagssysslor och småfix med personer i närområdet som kan hjälpa till. Genom att skapa konto och använda appen godkänner du dessa villkor. Godkänner du inte villkoren ska du inte använda Grannfix.",
  },
  {
    title: "Plattformens roll",
    body: "Grannfix är endast en förmedlingsplattform. Vi sammanför användare men är inte part i de avtal som ingås mellan dem. Grannfix är varken arbetsgivare, uppdragsgivare eller uppdragstagare. En användare som utför hjälp åt en annan är inte anställd av Grannfix och agerar för egen räkning. Allt ansvar för utförande, kvalitet, säkerhet och betalning ligger hos de användare som ingår avtalet.",
  },
  {
    title: "Behörighet",
    body: "Du måste ha fyllt 18 år för att använda Grannfix. Genom att använda appen intygar du att du är myndig och har rätt att ingå avtal.",
  },
  {
    title: "Ditt konto",
    body: "Du ansvarar för att uppgifterna i ditt konto är korrekta och aktuella. Du ansvarar för att hålla ditt lösenord hemligt och för all aktivitet som sker via ditt konto. Misstänker du obehörig åtkomst ska du kontakta oss omgående.",
  },
  {
    title: "Identitetsverifiering",
    body: "Grannfix kan erbjuda verifiering av identitet med BankID. En verifierad markering visar att en användares identitet har bekräftats, men är ingen garanti för användarens pålitlighet eller för kvaliteten på utförd hjälp.",
  },
  {
    title: "Användaransvar",
    body: "Du ansvarar för allt innehåll du publicerar och för alla överenskommelser du ingår med andra användare. Du ansvarar för att den hjälp du erbjuder eller efterfrågar är laglig och att du har rätt att utföra eller beställa den.",
  },
  {
    title: "Innehåll du laddar upp",
    body: "Du behåller rättigheterna till det innehåll du laddar upp, till exempel bilder och beskrivningar. Genom att ladda upp innehåll ger du Grannfix en kostnadsfri rätt att lagra och visa innehållet i den utsträckning som behövs för att driva tjänsten. Du intygar att du har rätt till det innehåll du laddar upp.",
  },
  {
    title: "Förbjudet beteende",
    body: "Det är inte tillåtet att använda Grannfix för olaglig verksamhet, publicera vilseledande eller stötande innehåll, trakassera andra användare, kringgå plattformens funktioner för säkerhet eller betalning, eller skapa konton i någon annans namn. Du kan blockera och rapportera användare direkt i appen. Missbruk kan leda till avstängning.",
  },
  {
    title: "Recensioner och betyg",
    body: "Efter avslutad hjälp kan användare lämna betyg och recensioner om varandra. Recensioner ska vara ärliga och bygga på egen erfarenhet. Grannfix kan ta bort recensioner som är kränkande, falska eller bryter mot dessa villkor.",
  },
  {
    title: "Betalning",
    body: "Priser och ersättning avtalas direkt mellan användarna. Grannfix kan underlätta betalning genom att länka vidare till Swish med förifylld information, men Grannfix tar inte emot, håller eller processar några pengar. Grannfix är inte part i transaktionen och ansvarar inte för uteblivna betalningar eller ekonomiska tvister mellan användare.",
  },
  {
    title: "Avstängning och radering",
    body: "Grannfix kan stänga av eller ta bort ett konto som bryter mot villkoren eller som skadar andra användare eller tjänsten. Du kan när som helst radera ditt konto i appen via Inställningar. Vid radering hanteras dina personuppgifter enligt vår integritetspolicy.",
  },
  {
    title: "Ansvarsbegränsning",
    body: "Grannfix tillhandahåller plattformen i befintligt skick. Vi garanterar inte att tjänsten alltid är tillgänglig eller felfri. I den utsträckning som lagen tillåter ansvarar Grannfix inte för skador, förluster eller tvister som uppstår mellan användare eller till följd av hjälp som utförts via plattformen. Begränsningen gäller inte vid uppsåt eller grov vårdslöshet från Grannfix sida, och påverkar inte de rättigheter du har som konsument enligt tvingande lag.",
  },
  {
    title: "Tvistlösning och tillämplig lag",
    body: "Dessa villkor regleras av svensk lag. Om en tvist uppstår mellan dig och Grannfix försöker vi i första hand lösa den tillsammans med dig. Du som konsument kan även vända dig till Allmänna reklamationsnämnden (ARN) eller till allmän domstol.",
  },
  {
    title: "Ändringar av villkoren",
    body: "Vi kan uppdatera dessa villkor. Vid väsentliga ändringar meddelar vi dig i appen eller via e-post innan de träder i kraft. Fortsatt användning efter att ändringarna trätt i kraft innebär att du godkänner dem.",
  },
  {
    title: "Kontakt",
    body: "Har du frågor om dessa villkor? Kontakta oss på support@grannfix.se.",
  },
];

export default function TermsScreen() {
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
        <Text style={styles.title}>Användarvillkor</Text>
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
