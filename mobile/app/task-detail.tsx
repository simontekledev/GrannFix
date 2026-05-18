import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import { taskApi, chatApi, taskOfferApi, offerApi } from "@/src/api/client";
import type { OfferResponse } from "@/src/api/generated/models/OfferResponse";
import { useUser } from "@/src/context/UserContext";
import { useTheme } from "@/src/context/ThemeContext";
import { createTaskDetailStyles } from "@/src/styles/screens/taskDetail";
import { TaskDetailSkeleton } from "@/src/components/Skeleton";
import { OfferCard } from "@/src/components/OfferCard";
import { RateHelperSection } from "@/src/components/RateHelperSection";
import { CreateOfferModal } from "@/src/components/CreateOfferModal";
import { EditTaskModal } from "@/src/components/EditTaskModal";
import type { TaskDetailResponse } from "@/src/api/generated/models/TaskDetailResponse";
import { resolveImageUrl } from "@/src/helpers/images";


const STATUS_LABELS: Record<string, string> = {
  OPEN: "Öppen",
  ASSIGNED: "Tilldelad",
  COMPLETED: "Klar",
  CANCELLED: "Avbruten",
};

const STATUS_COLORS = {
  OPEN: "#22C55E",       
  ASSIGNED: "#F59E0B",  
  COMPLETED: "#6366F1", 
  CANCELLED: "#EF4444",  
};

export default function TaskDetailScreen() {
  const router = useRouter();
  const { id, offer } = useLocalSearchParams<{ id: string; offer?: string }>();
  const { user } = useUser();
  const { colors } = useTheme();
  const styles = useMemo(() => createTaskDetailStyles(colors), [colors]);
  const [task, setTask] = useState<TaskDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Offers list
  const [offers, setOffers] = useState<OfferResponse[]>([]);
  const [showOffers, setShowOffers] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  // Mark done / confirm done
  const [markingDone, setMarkingDone] = useState(false);
  const [openingSwish, setOpeningSwish] = useState(false);

  async function handleSwish() {
    if (!id) return;
    setOpeningSwish(true);
    try {
      const info = await taskApi.getPaymentInfo({ id });
      const phone = (info.helperPhoneNumber ?? "").replace(/[^0-9]/g, "");
      const swishPhone = phone.startsWith("46") ? "0" + phone.slice(2) : phone;
      const data = {
        payee: swishPhone,
        amount: info.amount?.toString() ?? "",
        message: info.taskReference ?? "GrannFix",
      };
      const url = `swish://payment?data=${encodeURIComponent(JSON.stringify(data))}`;
      try {
        await Linking.openURL(url);
      } catch {
        const msg = "Swish-appen kunde inte öppnas. Är den installerad?";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Swish saknas", msg);
      }
    } catch (e: any) {
      console.log("Swish payment-info error:", e);
      const msg = "Kunde inte hämta betalningsinfo.";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
    } finally {
      setOpeningSwish(false);
    }
  }
  const [confirmingDone, setConfirmingDone] = useState(false);

  // Rating
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  async function loadOffers() {
    if (!id) return;
    try {
      const res = await taskOfferApi.getOffers({ taskId: id });
      setOffers(res);
    } catch (e) {
      console.log("Failed to load offers:", e);
    }
  }

  async function handleMarkDone() {
    const acceptedOffer = offers.find((o) => o.status === "ACCEPTED");
    if (!acceptedOffer?.id) return;
    setMarkingDone(true);
    try {
      await offerApi.markDoneOffer({ offerId: acceptedOffer.id });
      const updated = await taskApi.getTask({ id: id! });
      setTask(updated);
      loadOffers();
      if (Platform.OS === "web") window.alert("Uppdraget har markerats som klart!");
      else Alert.alert("Klart", "Uppdraget har markerats som klart. Väntar på bekräftelse.");
    } catch (e) {
      console.log("Mark done error:", e);
      const msg = "Kunde inte markera som klart";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
    } finally {
      setMarkingDone(false);
    }
  }

  async function handleConfirmDone() {
    const markedOffer = offers.find((o) => o.status === "MARKED_DONE");
    if (!markedOffer?.id) return;

    const doConfirm = async () => {
      setConfirmingDone(true);
      try {
        await offerApi.confirmDoneOffer({ offerId: markedOffer.id! });
        const updated = await taskApi.getTask({ id: id! });
        setTask(updated);
        loadOffers();
        if (Platform.OS === "web") window.alert("Uppdraget är slutfört!");
        else Alert.alert("Slutfört", "Uppdraget har bekräftats som klart!");
      } catch (e) {
        console.log("Confirm done error:", e);
        const msg = "Kunde inte bekräfta";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Fel", msg);
      } finally {
        setConfirmingDone(false);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Är du säker på att uppdraget är klart?")) doConfirm();
    } else {
      Alert.alert("Bekräfta", "Är du säker på att uppdraget är klart?", [
        { text: "Avbryt", style: "cancel" },
        { text: "Ja, bekräfta", onPress: doConfirm },
      ]);
    }
  }

  async function handleSubmitRating() {
    const completedOffer = offers.find((o) => o.status === "COMPLETED");
    if (!completedOffer?.id || ratingValue === 0) return;
    setSubmittingRating(true);
    try {
      await offerApi.rateHelper({
        offerId: completedOffer.id,
        rateHelperRequest: {
          rating: ratingValue,
          comment: ratingComment.trim() || undefined,
        },
      });
      setRatingSubmitted(true);
      const updated = await taskApi.getTask({ id: id! });
      setTask(updated);
      loadOffers();
    } catch (e) {
      console.log("Rating error:", e);
      if (Platform.OS === "web") window.alert("Kunde inte skicka betyg");
      else Alert.alert("Fel", "Kunde inte skicka betyg");
    } finally {
      setSubmittingRating(false);
    }
  }

  async function handleAcceptOffer(offerId: string) {
    setAcceptingId(offerId);
    try {
      await offerApi.acceptOffer({ offerId });
      const updated = await taskApi.getTask({ id: id! });
      setTask(updated);
      setShowOffers(false);
      if (Platform.OS === "web") window.alert("Erbjudande accepterat!");
      else Alert.alert("Accepterat", "Uppdraget har tilldelats");
    } catch (e: any) {
      console.log("Accept error:", e);
      const msg = "Kunde inte acceptera erbjudandet";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
    } finally {
      setAcceptingId(null);
    }
  }

  // Offer modal
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [sendingOffer, setSendingOffer] = useState(false);

  async function handleSendOffer(payload: { price?: number; message?: string }) {
    if (!id) return;
    setSendingOffer(true);
    try {
      await taskOfferApi.createOffer({
        taskId: id,
        createOfferRequest: {
          proposedPrice: payload.price,
          message: payload.message,
        },
      });
      const updated = await taskApi.getTask({ id });
      setTask(updated);
      if (Platform.OS === "web") window.alert("Erbjudande skickat!");
      else Alert.alert("Skickat", "Ditt erbjudande har skickats");
    } catch (e: any) {
      console.log("Offer error:", e);
      const msg = "Kunde inte skicka erbjudandet";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
      throw e;
    } finally {
      setSendingOffer(false);
    }
  }

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);

  function openEditModal() {
    if (!task) return;
    setShowEditModal(true);
  }

  async function handleSaveEdit(payload: { title: string; description: string; price: number; street: string }) {
    if (!id) return;
    setSaving(true);
    try {
      await taskApi.updateMyTask({
        id,
        updateTaskRequest: {
          title: payload.title,
          description: payload.description,
          offeredPrice: payload.price,
          street: payload.street,
        },
      });
      const updated = await taskApi.getTask({ id });
      setTask(updated);
    } catch (e: any) {
      console.log("Edit task error:", e);
      const msg = "Kunde inte uppdatera uppdraget";
      if (Platform.OS === "web") window.alert(msg);
      else Alert.alert("Fel", msg);
      throw e;
    } finally {
      setSaving(false);
    }
  }

  const reloadTask = useCallback(async () => {
    if (!id) return;
    try {
      const res = await taskApi.getTask({ id });
      setTask(res);
      if (
        (res.status === "ASSIGNED" || res.status === "COMPLETED") &&
        (res.createdBy?.id === user?.id || res.assignedTo?.id === user?.id)
      ) {
        loadOffers();
      }
    } catch (e) {
      console.log("Failed to load task:", e);
    }
  }, [id, user?.id]);

  useEffect(() => {
    if (!id) return;
    setTask(null);
    setLoading(true);
    (async () => {
      try {
        const res = await taskApi.getTask({ id });
        setTask(res);
        if (offer === "true" && res.permissions?.canOffer) {
          setShowOfferModal(true);
        }
        if (
          (res.status === "ASSIGNED" || res.status === "COMPLETED") &&
          (res.createdBy?.id === user?.id || res.assignedTo?.id === user?.id)
        ) {
          loadOffers();
        }
      } catch (e) {
        console.log("Failed to load task:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const hasMounted = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasMounted.current) {
        hasMounted.current = true;
        return;
      }
      if (id) reloadTask();
    }, [id, reloadTask])
  );

  async function handleCancel() {
    if (!id) return;
    const doCancel = async () => {
      setCancelling(true);
      try {
        await taskApi.cancelTask({ id });
        router.back();
      } catch (e) {
        console.log("Cancel error:", e);
        const msg = "Kunde inte avbryta uppdraget";
        if (Platform.OS === "web") window.alert(msg);
        else Alert.alert("Fel", msg);
      } finally {
        setCancelling(false);
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm("Vill du avbryta detta uppdrag?")) doCancel();
    } else {
      Alert.alert("Avbryt uppdrag", "Vill du avbryta detta uppdrag?", [
        { text: "Nej", style: "cancel" },
        { text: "Avbryt uppdrag", style: "destructive", onPress: doCancel },
      ]);
    }
  }

  async function handleChat() {
    if (!id) return;
    try {
      const chat = await chatApi.getOrCreateChat({ taskId: id });
      const helperName = task?.assignedTo?.name ?? "";
      const taskTitle = task?.title ?? "";
      router.push(`/chat-conversation?chatId=${chat.id}&taskId=${id}&name=${encodeURIComponent(helperName)}&taskTitle=${encodeURIComponent(taskTitle)}&otherUserId=${task?.assignedTo?.id ?? ""}&otherUserImage=${encodeURIComponent(task?.assignedTo?.profileImageUrl ?? "")}` as any);
    } catch (e) {
      console.log("Chat error:", e);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <TaskDetailSkeleton />
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Uppdraget kunde inte hittas</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>← Tillbaka</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const status = task.status ?? "OPEN";
  const statusColor = STATUS_COLORS[status] ?? "#888";
  const perms = task.permissions;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Text style={styles.backText}>← Tillbaka</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{task.title}</Text>

        <View style={styles.metaRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "18" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {STATUS_LABELS[status] ?? status}
            </Text>
          </View>
          {task.offeredPrice != null && (
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>{task.offeredPrice} kr</Text>
            </View>
          )}
          {task.createdAt && (
            <Text style={styles.dateText}>
              {task.createdAt.toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })}
            </Text>
          )}
        </View>

        {task.description ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>BESKRIVNING</Text>
            <Text style={styles.description}>{task.description}</Text>
          </View>
        ) : null}

        {(task.imageUrls?.length ?? 0) > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>BILDER</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {task.imageUrls!.map((url: string, i: number) => (
                  <Image
                    key={i}
                    source={{ uri: resolveImageUrl(url)! }}
                    style={styles.taskImage}
                    resizeMode="cover"
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {task.offersCount != null && task.offersCount > 0 && task.createdBy?.id === user?.id && (
          <View style={styles.card}>
            <Pressable
              onPress={() => {
                if (!showOffers) loadOffers();
                setShowOffers((prev) => !prev);
              }}
              style={styles.offerHeaderRow}
            >
              <Text style={styles.sectionTitle}>ERBJUDANDEN</Text>
              <View style={styles.offersCountRow}>
                <View style={styles.offersCountBadge}>
                  <Text style={styles.offersCountText}>{task.offersCount}</Text>
                </View>
                <Text style={styles.expandArrow}>{showOffers ? "▲" : "▼"}</Text>
              </View>
            </Pressable>

            {showOffers && (
              <View style={styles.offersList}>
                {offers.length === 0 ? (
                  <ActivityIndicator color={colors.accent} style={{ paddingVertical: 12 }} />
                ) : (
                  offers
                    .filter((o) => o.status === "PENDING")
                    .map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        isAccepting={acceptingId === offer.id}
                        onAccept={(id) => handleAcceptOffer(id)}
                        onPressHelper={(helperId) =>
                          router.push(`/public-user?id=${helperId}` as any)
                        }
                      />
                    ))
                )}
              </View>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>PLATS</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Stad</Text>
            <Text style={styles.detailValue}>{task.city ?? "—"}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Område</Text>
            <Text style={styles.detailValue}>{task.area ?? "—"}</Text>
          </View>
          {task.street ? (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Adress</Text>
                <Text style={styles.detailValue}>{task.street}</Text>
              </View>
            </>
          ) : null}
        </View>

        {task.createdBy && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>SKAPAD AV</Text>
            {task.createdBy.id === user?.id ? (
              <View style={styles.userRow}>
                {task.createdBy.profileImageUrl ? (
                  <Image source={{ uri: resolveImageUrl(task.createdBy.profileImageUrl)! }} style={styles.userAvatarImage} />
                ) : (
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {(task.createdBy.name ?? "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.userName}>{task.createdBy.name} (jag)</Text>
              </View>
            ) : (
              <Pressable
                onPress={() => router.push(`/public-user?id=${task.createdBy?.id}` as any)}
                style={styles.userRow}
              >
                {task.createdBy.profileImageUrl ? (
                  <Image source={{ uri: resolveImageUrl(task.createdBy.profileImageUrl)! }} style={styles.userAvatarImage} />
                ) : (
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {(task.createdBy.name ?? "?").charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.userName}>{task.createdBy.name}</Text>
                <Text style={styles.userArrow}>›</Text>
              </Pressable>
            )}
          </View>
        )}

        {task.assignedTo && (
          <Pressable
            style={({ pressed }) => [styles.card, perms?.canChat && styles.cardChatActive, pressed && { opacity: 0.7 }]}
            onPress={
              perms?.canChat
                ? handleChat
                : task.assignedTo.id !== user?.id
                ? () => router.push(`/public-user?id=${task.assignedTo?.id}` as any)
                : undefined
            }
          >
            <Text style={styles.sectionTitle}>HJÄLPARE</Text>
            <View style={styles.userRow}>
              {task.assignedTo.profileImageUrl ? (
                <Image source={{ uri: resolveImageUrl(task.assignedTo.profileImageUrl)! }} style={styles.userAvatarImage} />
              ) : (
                <View style={[styles.userAvatar, { backgroundColor: "#16A34A" }]}>
                  <Text style={styles.userAvatarText}>
                    {(task.assignedTo.name ?? "?").charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <Text style={styles.userName}>
                {task.assignedTo.name}{task.assignedTo.id === user?.id ? " (jag)" : ""}
              </Text>
              {perms?.canChat && (
                <View style={styles.chatBubble}>
                  <Image
                    source={require("@/assets/images/chat-icon.png")}
                    style={styles.chatBubbleIcon}
                    resizeMode="contain"
                  />
                </View>
              )}
              {!perms?.canChat && task.assignedTo.id !== user?.id && (
                <Text style={styles.userArrow}>›</Text>
              )}
            </View>
          </Pressable>
        )}

        {task.completedAt && (
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Slutfört</Text>
              <Text style={styles.detailValue}>
                {task.completedAt.toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" })}
              </Text>
            </View>
          </View>
        )}

        {status === "COMPLETED" && task.createdBy?.id === user?.id && (() => {
          const completedOffer = offers.find((o) => o.status === "COMPLETED");
          if (!completedOffer) return null;
          const savedRating = completedOffer.rating;
          const submittedRating =
            ratingSubmitted ? ratingValue : (savedRating ?? null);
          return (
            <RateHelperSection
              submittedRating={submittedRating}
              ratingValue={ratingValue}
              onChangeRating={setRatingValue}
              comment={ratingComment}
              onChangeComment={setRatingComment}
              submitting={submittingRating}
              onSubmit={handleSubmitRating}
            />
          );
        })()}

        <View style={styles.actions}>
          {perms?.canOffer && (
            <Pressable
              style={({ pressed, hovered }: any) => [
                styles.primaryButton,
                hovered && styles.primaryButtonHovered,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={() => setShowOfferModal(true)}
            >
              <Text style={styles.primaryButtonText}>Hjälp till</Text>
            </Pressable>
          )}

          {status === "ASSIGNED" && task.assignedTo?.id === user?.id && (() => {
            const acceptedOffer = offers.find((o) => o.status === "ACCEPTED");
            const markedOffer = offers.find((o) => o.status === "MARKED_DONE");
            if (markedOffer) {
              return (
                <View style={styles.infoBanner}>
                  <Text style={styles.infoBannerText}>Väntar på att uppdragsskaparen bekräftar</Text>
                </View>
              );
            }
            if (acceptedOffer) {
              return (
                <Pressable
                  onPress={handleMarkDone}
                  disabled={markingDone}
                  style={({ pressed, hovered }: any) => [
                    styles.primaryButton,
                    hovered && styles.primaryButtonHovered,
                    pressed && styles.primaryButtonPressed,
                    markingDone && { opacity: 0.35 },
                  ]}
                >
                  {markingDone ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Markera som klar</Text>
                  )}
                </Pressable>
              );
            }
            return null;
          })()}

          {status === "ASSIGNED" && task.createdBy?.id === user?.id && (() => {
            const markedOffer = offers.find((o) => o.status === "MARKED_DONE");
            if (markedOffer) {
              return (
                <Pressable
                  onPress={handleConfirmDone}
                  disabled={confirmingDone}
                  style={({ pressed, hovered }: any) => [
                    styles.primaryButton,
                    hovered && styles.primaryButtonHovered,
                    pressed && styles.primaryButtonPressed,
                    confirmingDone && { opacity: 0.35 },
                  ]}
                >
                  {confirmingDone ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Bekräfta klar</Text>
                  )}
                </Pressable>
              );
            }
            return null;
          })()}

          {task.createdBy?.id === user?.id &&
            task.assignedTo &&
            (status === "ASSIGNED" || status === "COMPLETED") && (
              <Pressable
                onPress={handleSwish}
                disabled={openingSwish}
                style={({ pressed, hovered }: any) => [
                  styles.primaryButton,
                  hovered && styles.primaryButtonHovered,
                  pressed && styles.primaryButtonPressed,
                  openingSwish && { opacity: 0.35 },
                ]}
              >
                {openingSwish ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Swisha hjälpare</Text>
                )}
              </Pressable>
            )}

          {perms?.canEdit && (
            <Pressable
              style={({ pressed }) => [styles.outlineButton, pressed && { opacity: 0.7 }]}
              onPress={openEditModal}
            >
              <Text style={styles.outlineButtonText}>Redigera</Text>
            </Pressable>
          )}

          {perms?.canCancel && (
            <Pressable
              onPress={handleCancel}
              disabled={cancelling}
              style={({ pressed, hovered }: any) => [
                styles.dangerButton,
                hovered && styles.dangerButtonHovered,
                pressed && styles.dangerButtonPressed,
              ]}
            >
              <Text style={styles.dangerButtonText}>
                {cancelling ? "Avbryter..." : "Avbryt uppdrag"}
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      <CreateOfferModal
        visible={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        onSubmit={handleSendOffer}
        submitting={sendingOffer}
        suggestedPrice={task?.offeredPrice ? Number(task.offeredPrice) : null}
      />

      <EditTaskModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={handleSaveEdit}
        saving={saving}
        initialValues={{
          title: task?.title,
          description: task?.description,
          price: task?.offeredPrice,
          street: task?.street,
        }}
      />
    </SafeAreaView>
  );
}

