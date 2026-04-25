import React, { useMemo, useState } from "react";
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { blockApi } from "@/src/api/client";
import { useTheme, ThemeColors } from "@/src/context/ThemeContext";
import { useBlockedUsers } from "@/src/context/BlockedUsersContext";
import { createModalStyles } from "@/src/styles/modal";
import { ReportUserSheet } from "./ReportUserSheet";

interface Props {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
  contextTaskId?: string;
  contextChatId?: string;
  onBlocked?: () => void;
}

export function UserActionSheet({
  visible,
  onClose,
  userId,
  userName,
  contextTaskId,
  contextChatId,
  onBlocked,
}: Props) {
  const { colors } = useTheme();
  const modalStyles = useMemo(() => createModalStyles(colors), [colors]);
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { addBlocked } = useBlockedUsers();

  const [showReport, setShowReport] = useState(false);

  function confirmBlock() {
    onClose();
    const title = "Blockera användare";
    const message = userName
      ? `Är du säker på att du vill blockera ${userName}? Ni kan inte längre se varandras uppdrag eller skicka meddelanden.`
      : "Är du säker på att du vill blockera denna användare?";

    if (Platform.OS === "web") {
      if (window.confirm(`${title}\n\n${message}`)) doBlock();
      return;
    }

    Alert.alert(title, message, [
      { text: "Avbryt", style: "cancel" },
      { text: "Blockera", style: "destructive", onPress: doBlock },
    ]);
  }

  async function doBlock() {
    try {
      await blockApi.blockUser({ userId });
      addBlocked(userId);
      const msg = userName
        ? `${userName} är nu blockerad.`
        : "Användaren är nu blockerad.";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Blockerad", msg);
      onBlocked?.();
    } catch (e: any) {
      const msg = e?.response?.status === 409
        ? "Användaren är redan blockerad."
        : "Kunde inte blockera användaren. Försök igen.";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Något gick fel", msg);
    }
  }

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <View style={modalStyles.overlay}>
          <Pressable style={modalStyles.overlayTouchable} onPress={onClose} />
          <View style={modalStyles.content}>
            <View style={modalStyles.handle} />
            {userName && <Text style={styles.userName}>{userName}</Text>}

            <Pressable
              onPress={() => {
                onClose();
                setTimeout(() => setShowReport(true), 250);
              }}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <Text style={styles.rowIcon}>🚩</Text>
              <Text style={styles.rowText}>Rapportera</Text>
            </Pressable>

            <Pressable
              onPress={confirmBlock}
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            >
              <Text style={styles.rowIcon}>🚫</Text>
              <Text style={[styles.rowText, styles.rowTextDanger]}>Blockera</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.cancelButton, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.cancelText}>Avbryt</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <ReportUserSheet
        visible={showReport}
        onClose={() => setShowReport(false)}
        reportedUserId={userId}
        reportedUserName={userName}
        contextTaskId={contextTaskId}
        contextChatId={contextChatId}
      />
    </>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    userName: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textSecondary,
      textAlign: "center",
      marginBottom: 12,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 14,
    },
    rowPressed: {
      backgroundColor: colors.background,
    },
    rowIcon: {
      fontSize: 18,
    },
    rowText: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.textPrimary,
    },
    rowTextDanger: {
      color: "#EF4444",
      fontWeight: "600",
    },
    cancelButton: {
      marginTop: 14,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: "center",
    },
    cancelText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.textPrimary,
    },
  });
}
