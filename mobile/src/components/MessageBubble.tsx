import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";

interface Props {
  content: string;
  isMe: boolean;
  isFirstInGroup: boolean;
  isLastInGroup: boolean;
  /** Pre-formatted time label (e.g. "14:32"). Renders below bubble when set. */
  timeLabel?: string | null;
}

export function MessageBubble({
  content,
  isMe,
  isFirstInGroup,
  isLastInGroup,
  timeLabel,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const cornerStyle = isMe
    ? {
        borderTopRightRadius: isFirstInGroup ? 18 : 6,
        borderBottomRightRadius: isLastInGroup ? 18 : 6,
      }
    : {
        borderTopLeftRadius: isFirstInGroup ? 18 : 6,
        borderBottomLeftRadius: isLastInGroup ? 18 : 6,
      };

  return (
    <View style={isMe ? styles.rowMe : styles.rowThem}>
      <View
        style={[
          styles.bubble,
          isMe ? styles.bubbleMe : styles.bubbleThem,
          cornerStyle,
          { marginTop: isFirstInGroup ? 12 : 2 },
        ]}
      >
        <Text
          style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}
        >
          {content}
        </Text>
      </View>
      {timeLabel && (
        <Text
          style={[styles.timeBelow, isMe ? styles.timeBelowMe : styles.timeBelowThem]}
        >
          {timeLabel}
        </Text>
      )}
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    rowMe: { alignItems: "flex-end" },
    rowThem: { alignItems: "flex-start" },
    bubble: {
      maxWidth: "78%",
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 18,
    },
    bubbleMe: {
      backgroundColor: colors.accent,
    },
    bubbleThem: {
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    bubbleText: {
      fontSize: 15,
      lineHeight: 21,
    },
    bubbleTextMe: { color: "#fff" },
    bubbleTextThem: { color: colors.textPrimary },
    timeBelow: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 3,
      marginBottom: 4,
    },
    timeBelowMe: { marginRight: 4 },
    timeBelowThem: { marginLeft: 4 },
  });
}
