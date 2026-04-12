import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function TaskCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[skeletonStyles.card, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <View style={skeletonStyles.row}>
        <Skeleton width="60%" height={18} />
        <Skeleton width={60} height={24} borderRadius={6} />
      </View>
      <Skeleton width="35%" height={14} style={{ marginTop: 10 }} />
      <Skeleton width="90%" height={14} style={{ marginTop: 12 }} />
      <Skeleton width="70%" height={14} style={{ marginTop: 6 }} />
      <View style={[skeletonStyles.row, { marginTop: 14 }]}>
        <Skeleton width={80} height={12} />
        <Skeleton width={90} height={12} />
      </View>
    </View>
  );
}

export function ChatRowSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[skeletonStyles.chatRow, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={skeletonStyles.row}>
          <Skeleton width="50%" height={16} />
          <Skeleton width={50} height={12} />
        </View>
        <Skeleton width="70%" height={13} style={{ marginTop: 6 }} />
      </View>
    </View>
  );
}

export function ProfileSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={skeletonStyles.profileContainer}>
      <View style={{ alignItems: "center", marginBottom: 28 }}>
        <Skeleton width={140} height={140} borderRadius={70} />
        <Skeleton width={160} height={24} style={{ marginTop: 14 }} />
        <Skeleton width={100} height={16} style={{ marginTop: 8 }} />
      </View>
      <Skeleton width="30%" height={12} style={{ marginBottom: 8 }} />
      <View style={[skeletonStyles.detailCard, { backgroundColor: colors.card }]}>
        <View style={skeletonStyles.detailRow}>
          <Skeleton width={60} height={14} />
          <Skeleton width={120} height={14} />
        </View>
        <View style={[skeletonStyles.divider, { backgroundColor: colors.divider }]} />
        <View style={skeletonStyles.detailRow}>
          <Skeleton width={50} height={14} />
          <Skeleton width={100} height={14} />
        </View>
      </View>
    </View>
  );
}

export function DiscoverListSkeleton() {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
      <Skeleton width={140} height={14} style={{ marginBottom: 12 }} />
      <TaskCardSkeleton />
      <TaskCardSkeleton />
      <TaskCardSkeleton />
    </View>
  );
}

export function ChatListSkeleton() {
  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 8 }}>
      <ChatRowSkeleton />
      <ChatRowSkeleton />
      <ChatRowSkeleton />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  profileContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  detailCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  divider: {
    height: 1,
  },
});
