import React, { useEffect, useMemo, useState } from "react";
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
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { useUser } from "@/src/context/UserContext";
import { resolveImageUrl } from "@/src/helpers/images";
import { UserActionSheet } from "@/src/components/UserActionSheet";

export default function PublicUserScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user: currentUser, loggedIn } = useUser();
  const [user, setUser] = useState<PublicUserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [showVerifiedTooltip, setShowVerifiedTooltip] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isOwnProfile = !!currentUser?.id && currentUser.id === id;
  const canModerate = loggedIn && !isOwnProfile && !!id;

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
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Användaren kunde inte hittas</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
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
          onPress={() => router.back()}
          style={({ pressed }) => [pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backText}>← Tillbaka</Text>
        </Pressable>
        {canModerate && (
          <Pressable
            onPress={() => setShowActions(true)}
            style={({ pressed }) => [styles.menuButton, pressed && { opacity: 0.5 }]}
            hitSlop={12}
          >
            <Text style={styles.menuButtonText}>⋯</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.profileScroll}>
        <View style={styles.profileHero}>
          <View style={styles.profileIconWrapper}>
            {user.profileImageUrl ? (
              <Image
                source={{ uri: resolveImageUrl(user.profileImageUrl)! }}
                style={styles.profileIcon}
              />
            ) : (
              <Image
                source={require("@/assets/images/user-profile1-icon.png")}
                style={styles.profileIcon}
              />
            )}
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

          {(user.ratingCount ?? 0) > 0 ? (
            <Pressable
              onPress={() => router.push(`/user-reviews?id=${id}&name=${encodeURIComponent(user.name ?? "")}` as any)}
              style={({ pressed }) => [styles.ratingPressable, pressed && { opacity: 0.6 }]}
            >
              <StarRating rating={user.ratingAverage ?? 0} color="green" />
              <Text style={styles.reviewsLink}>
                {user.ratingCount === 1
                  ? "1 recension ›"
                  : `${user.ratingCount} recensioner ›`}
              </Text>
            </Pressable>
          ) : (
            <StarRating rating={user.ratingAverage ?? 0} color="green" />
          )}

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
              {(user.completedOffersCount ?? 0) === 0
                ? "Inga slutförda uppdrag"
                : (user.completedOffersCount ?? 0) === 1
                ? "1 slutfört uppdrag"
                : `${user.completedOffersCount} slutförda uppdrag`}
            </Text>
          </View>
        </View>
      </ScrollView>

      {canModerate && id && (
        <UserActionSheet
          visible={showActions}
          onClose={() => setShowActions(false)}
          userId={id}
          userName={user.name ?? undefined}
          onBlocked={() => router.replace("/(tabs)" as any)}
        />
      )}
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
    errorText: {
      fontSize: 16,
      color: colors.textMuted,
      marginBottom: 16,
    },
    backLink: {
      padding: 8,
    },
    backLinkText: {
      fontSize: 15,
      color: colors.accent,
      fontWeight: "600",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 12,
    },
    menuButton: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    menuButtonText: {
      fontSize: 26,
      color: colors.textPrimary,
      fontWeight: "700",
      marginTop: -10,
    },
    backText: {
      fontSize: 15,
      color: colors.accent,
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
      backgroundColor: colors.card,
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
      color: colors.textPrimary,
      marginBottom: 6,
    },
    ratingPressable: {
      alignItems: "center",
      paddingVertical: 4,
      marginBottom: 6,
    },
    reviewsLink: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.accent,
      marginTop: -4,
    },
    bioText: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 10,
      paddingHorizontal: 12,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: colors.textMuted,
      marginBottom: 8,
      marginTop: 4,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    detailCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 16,
      shadowColor: colors.shadow,
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
      color: colors.textMuted,
    },
    detailValue: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.textPrimary,
      textAlign: "right",
      flex: 1,
      marginLeft: 16,
    },
    detailDivider: {
      height: 1,
      backgroundColor: colors.divider,
    },
  });
}
