import APP_FONT_FAMILY from "@/components/styles/font";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import { useMutate } from "@/hooks/useMutate";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  I18nManager,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import CommentItem from "./CommentItem";
import TaskMapModal from "./Taskmapmodal";
import { Task } from "./types";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const PRIMARY = Colors.light.secondary;

const ICON_BG = Colors.light.primary;

interface Props {
  task: Task;
  theme: any;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

interface AddCommentProps {
  taskId: number;
  employeeId: number | string;
  onCommentAdded: (newComment: any) => void;
  theme: any;
}

const AddComment = React.memo(
  ({ taskId, employeeId, onCommentAdded }: AddCommentProps) => {
    const [text, setText] = useState("");

    const { mutate: postComment, isPending } = useMutate<any>({
      endpoint: `task-comments/${taskId}`,
      mutationKey: ["task-comments", taskId],
      onSuccess: (response) => {
        setText("");
        const comment = response?.comment ?? response?.data ?? response;
        onCommentAdded(comment);
      },
    });

    const submit = useCallback(() => {
      const trimmed = text.trim();
      if (!trimmed || isPending) return;
      postComment({ employee_id: employeeId, comment: trimmed });
    }, [text, isPending, employeeId, postComment]);

    return (
      <View style={styles.addCommentRow}>
        <TouchableOpacity
          onPress={submit}
          disabled={isPending || !text.trim()}
          style={[
            styles.sendBtn,
            (isPending || !text.trim()) && { opacity: 0.45 },
          ]}
          activeOpacity={0.8}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons
              name="send"
              size={15}
              color="#fff"
              style={{ transform: [{ scaleX: I18nManager.isRTL ? 1 : -1 }] }}
            />
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.commentInput}
          placeholder="أضف تعليقاً…"
          placeholderTextColor="#bbb"
          value={text}
          onChangeText={setText}
          multiline
          textAlign="right"
          returnKeyType="send"
          onSubmitEditing={submit}
        />
      </View>
    );
  },
);

// ── CommentsSection ────────────────────────────────────────────────────────────
interface CommentsSectionProps {
  task: Task;
  theme: any;
  employeeId: number | string;
}

const CommentsSection = React.memo(
  ({ task, theme, employeeId }: CommentsSectionProps) => {
    const [comments, setComments] = useState<Task["comments"]>(
      task.comments ?? [],
    );
    const scrollViewRef = useRef<ScrollView>(null);

    const handleNewComment = useCallback((newComment: any) => {
      if (
        !newComment ||
        typeof newComment !== "object" ||
        Array.isArray(newComment)
      )
        return;
      const normalized = {
        ...newComment,
        id: newComment.id ?? `temp-${Date.now()}`,
      };
      setComments((prev) => [...prev, normalized]);
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }, []);

    return (
      <View style={styles.commentsWrapper}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.commentsScrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {comments.length > 0 ? (
            <View style={styles.commentsList}>
              {comments.map((c, index) => (
                <CommentItem key={c.id ?? `comment-${index}`} comment={c} />
              ))}
            </View>
          ) : (
            <Text style={styles.noComments}>لا توجد تعليقات بعد</Text>
          )}
        </ScrollView>

        <AddComment
          taskId={task.id}
          employeeId={employeeId}
          onCommentAdded={handleNewComment}
          theme={theme}
        />
      </View>
    );
  },
);

// ── TaskItem ───────────────────────────────────────────────────────────────────
const TaskItem = React.memo(({ task, theme }: Props) => {
  const { user } = useAuth() as any;
  const employeeId = (user as any)?.employee?.id;

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const canCheckin = task.can_checkin === 1;
  const commentCount = task.comments?.length ?? 0;

  const toggleComments = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCommentsOpen((p) => !p);
  }, []);

  const { mutate: doCheckin, isPending: checkinLoading } = useMutate<any>({
    endpoint: `itineraries/${task.id}/checkin`,
    mutationKey: ["checkin", task.id],
    onSuccess: () => {
      Alert.alert("✅", "تم تسجيل الحضور بنجاح");
    },
  });

  const handleCheckin = useCallback(async () => {
    if (!canCheckin || checkinLoading || isLocating) return;

    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("خطأ", "مش قادر أوصل للموقع، اسمح للتطبيق بالوصول");
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      doCheckin({
        employee_id: employeeId,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } finally {
      setIsLocating(false);
    }
  }, [canCheckin, checkinLoading, isLocating, doCheckin, employeeId]);

  const isCheckinBusy = checkinLoading || isLocating;

  return (
    <View style={styles.card}>
      {/* ── Header ── */}
      <View style={styles.cardHeader}>
        <View style={styles.taskMeta}>
          <Text style={styles.taskName}>{task.name}</Text>
          <Text style={styles.taskDate}>{formatDate(task.created_at)}</Text>
        </View>
      </View>

      {/* ── Description ── */}
      {task.description ? (
        <Text style={styles.taskDescription}>{task.description}</Text>
      ) : null}

      {/* ── Comment count ── */}
      {commentCount > 0 && (
        <TouchableOpacity
          onPress={toggleComments}
          activeOpacity={0.7}
          style={styles.statsRow}
        >
          <Ionicons name="chatbubble-outline" size={13} color="#aaa" />
          <Text style={styles.statsText}>
            {commentCount} {commentCount === 1 ? "تعليق" : "تعليقات"}
          </Text>
        </TouchableOpacity>
      )}

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Actions ── */}
      <View style={styles.actionsRow}>
        {/* Comment */}
        <TouchableOpacity
          style={[styles.actionBtn, commentsOpen && styles.actionBtnActive]}
          onPress={toggleComments}
          activeOpacity={0.7}
        >
          <Ionicons
            name={commentsOpen ? "chatbubble" : "chatbubble-outline"}
            size={17}
            color={commentsOpen ? PRIMARY : "#888"}
          />
          <Text
            style={[styles.actionLabel, commentsOpen && { color: PRIMARY }]}
          >
            تعليق
          </Text>
        </TouchableOpacity>

        {/* Checkin */}
        <TouchableOpacity
          style={[styles.actionBtn, !canCheckin && styles.actionBtnDisabled]}
          onPress={handleCheckin}
          activeOpacity={canCheckin ? 0.7 : 1}
          disabled={!canCheckin || isCheckinBusy}
        >
          {isCheckinBusy ? (
            <ActivityIndicator size="small" color={PRIMARY} />
          ) : (
            <Ionicons
              name="location-outline"
              size={17}
              color={canCheckin ? "#888" : "#ccc"}
            />
          )}
          <Text style={[styles.actionLabel, !canCheckin && { color: "#ccc" }]}>
            تسجيل
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setMapVisible(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="map-outline" size={17} color="#888" />
          <Text style={styles.actionLabel}>الموقع</Text>
        </TouchableOpacity>
      </View>

      <TaskMapModal
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        taskLatitude={task.latitude}
        taskLongitude={task.longitude}
        taskName={task.name}
        theme={theme}
      />

      {commentsOpen && (
        <CommentsSection task={task} theme={theme} employeeId={employeeId} />
      )}
    </View>
  );
});

export default TaskItem;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(80,13,117,0.1)",
    marginBottom: 10,
    overflow: "hidden",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  /* Header */
  cardHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 8,
  },
  taskMeta: {
    flex: 1,
    alignItems: "flex-end",
  },
  taskName: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 15,
    fontWeight: "500",
    color: PRIMARY,
    textAlign: "right",
  },
  taskDate: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 11,
    color: "#aaa",
    textAlign: "right",
    marginTop: 3,
  },

  /* Description */
  taskDescription: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: "#555",
    textAlign: "right",
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },

  /* Stats */
  statsRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
  statsText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: "#aaa",
  },

  /* Divider */
  divider: {
    height: 0.5,
    backgroundColor: "rgba(80,13,117,0.1)",
    marginHorizontal: 14,
  },

  /* Actions */
  actionsRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-around",
    paddingVertical: 2,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 5,
    borderRadius: 6,
  },
  actionBtnActive: {
    backgroundColor: ICON_BG,
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: "#888",
  },

  /* Comments section */
  commentsWrapper: {
    borderTopWidth: 0.5,
    borderTopColor: "rgba(80,13,117,0.1)",
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
  },
  commentsScrollView: {
    maxHeight: 200,
  },
  commentsList: {
    marginBottom: 4,
  },
  noComments: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: "#bbb",
    textAlign: "center",
    paddingVertical: 10,
  },

  /* Add comment */
  addCommentRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(80,13,117,0.1)",
    paddingTop: 10,
    gap: 8,
    marginTop: 6,
  },
  commentInput: {
    flex: 1,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    borderWidth: 0.5,
    borderColor: "rgba(80,13,117,0.2)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    backgroundColor: "#faf7fc",
    textAlign: "right",
    maxHeight: 100,
    color: "#222",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: PRIMARY,
  },
});
