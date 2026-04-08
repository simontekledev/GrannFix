import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { userApi } from "@/src/api/client";
import type { PublicUserDto } from "@/src/api/generated/models/PublicUserDto";
import { StarRating } from "@/src/components/StarRating";

export default function PublicUserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [user, setUser] = useState<PublicUserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerifiedTooltip, setShowVerifiedTooltip] = useState(false);

  function goBack() {
    router.back();
  }

  useEffect(() => {
    if (!id) return;
    setUser(null);
    setLoading(true);
    (async () => {
      try {
        const res = await userApi.getPublicUser({ id });
        setUser(res);
      } catch (e) {
        console.log("Failed to load user:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#16A34A" />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Användaren kunde inte hittas</Text>
          <Pressable onPress={() => goBack()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Tillbaka</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => goBack()}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backText}>← Tillbaka</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.profileScroll}>
        <View style={styles.profileHero}>
          <View style={styles.profileIconWrapper}>
            <Image
              source={require("@/assets/images/user-profile1-icon.png")}
              style={styles.profileIcon}
            />
            {user.verified && (
              <Pressable
                onPress={() => {
                  setShowVerifiedTooltip(true);
                  setTimeout(() => setShowVerifiedTooltip(false), 2000);
                }}
                style={styles.verifiedIconWrapper}
              >
                <Image
                  source={require("@/assets/images/verified-icon.png")}
                  style={styles.verifiedIcon}
                  resizeMode="contain"
                />
              </Pressable>
            )}
          </View>
          {showVerifiedTooltip && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>Verifierad</Text>
            </View>
          )}
          <Text style={styles.profileName}>{user.name ?? "—"}</Text>

          <StarRating rating={user.ratingAverage ?? 0} color="green" />

          {user.bio ? (
            <Text style={styles.bioText}>{user.bio}</Text>
          ) : null}
        </View>

        <Text style={styles.sectionTitle}>Plats</Text>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stad</Text>
            <Text style={styles.detailValue}>{user.city ?? "—"}</Text>
          </View>
          <View style={styles.detailDivider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Område</Text>
            <Text style={styles.detailValue}>{user.area ?? "—"}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Statistik</Text>
        <View style={styles.detailCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Slutförda uppdrag</Text>
            <Text style={styles.detailValue}>
              {(user.ratingCount ?? 0) === 0
                ? "Inga slutförda uppdrag"
                : (user.ratingCount ?? 0) === 1
                ? "1 slutfört uppdrag"
                : `${user.ratingCount} slutförda uppdrag`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5faf2",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#888",
    marginBottom: 16,
  },
  backLink: {
    padding: 8,
  },
  backLinkText: {
    fontSize: 15,
    color: "#16A34A",
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backText: {
    fontSize: 15,
    color: "#16A34A",
    fontWeight: "600",
  },
  profileScroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 48,
  },
  profileHero: {
    alignItems: "center",
    marginBottom: 28,
    marginTop: 20,
  },
  profileIconWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  profileIcon: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  verifiedIconWrapper: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 2,
  },
  verifiedIcon: {
    width: 24,
    height: 24,
  },
  tooltip: {
    backgroundColor: "#E0ECFF",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: -4,
    marginBottom: -2,
  },
  tooltipText: {
    fontSize: 11,
    color: "#3B82F6",
    fontWeight: "500",
    letterSpacing: 0.3,
  },
  profileName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111",
    marginBottom: 6,
  },
  bioText: {
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 10,
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#999",
    marginBottom: 8,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#888",
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "500",
    color: "#222",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  detailDivider: {
    height: 1,
    backgroundColor: "#eee",
  },
});
