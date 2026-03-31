// import React, { useCallback, useState, useRef } from 'react';
// import {
//   View,
//   StyleSheet,
//   TouchableOpacity,
//   LayoutAnimation,
//   Platform,
//   UIManager,
//   TextInput,
//   ActivityIndicator,
//   I18nManager,
//   Alert,
//   KeyboardAvoidingView,
//   ScrollView,
// } from 'react-native';
// import { ThemedText } from '@/components/themed-text';
// import APP_FONT_FAMILY from '@/components/styles/font';
// import CommentItem from './CommentItem';
// import { Task } from './types';
// import { useAuth } from '@/hooks/useAuth';
// import { useMutate } from '@/hooks/useMutate';
// import { MaterialCommunityIcons } from '@expo/vector-icons';
// import TaskMapModal from './Taskmapmodal';

// if (Platform.OS === 'android') {
//   UIManager.setLayoutAnimationEnabledExperimental?.(true);
// }

// interface Props {
//   task: Task;
//   theme: any;
// }

// function formatDate(dateStr: string): string {
//   try {
//     const d = new Date(dateStr);
//     return d.toLocaleDateString('ar-EG', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   } catch {
//     return dateStr;
//   }
// }

// const CommentIcon = () => <ThemedText style={styles.actionIcon}>💬</ThemedText>;

// const CheckinIcon = ({ disabled }: { disabled: boolean }) => (
//   <ThemedText style={[styles.actionIcon, disabled && { opacity: 0.35 }]}>📍</ThemedText>
// );

// const SendIcon = () => (
//   <ThemedText style={styles.sendIcon}>➤</ThemedText>
// );

// const MapIcon = () => (
//   <MaterialCommunityIcons name="map-marker-radius-outline" size={22} color="#333" />
// );

// interface AddCommentProps {
//   taskId: number;
//   employeeId: number | string;
//   onCommentAdded: (newComment: any) => void;
//   theme: any;
// }

// const AddComment = React.memo(({ taskId, employeeId, onCommentAdded, theme }: AddCommentProps) => {
//   const [text, setText] = useState('');

//   const { mutate: postComment, isPending } = useMutate<any>({
//     endpoint: `task-comments/${taskId}`,
//     mutationKey: ['task-comments', taskId],
//     onSuccess: (response) => {
//       setText('');
//       const comment = response?.comment ?? response?.data ?? response;
//       onCommentAdded(comment);
//     },
//   });

//   const submit = useCallback(() => {
//     const trimmed = text.trim();
//     if (!trimmed || isPending) return;
//     postComment({ employee_id: employeeId, comment: trimmed });
//   }, [text, isPending, employeeId, postComment]);

//   return (
//     <View style={[styles.addCommentRow, { borderTopColor: theme.primary + '20' }]}>
//       <TouchableOpacity
//         onPress={submit}
//         disabled={isPending || !text.trim()}
//         style={[
//           styles.sendBtn,
//           { backgroundColor: theme.primary },
//           (isPending || !text.trim()) && { opacity: 0.5 },
//         ]}
//         activeOpacity={0.8}
//       >
//         {isPending ? (
//           <ActivityIndicator size="small" color="#fff" />
//         ) : (
//           <SendIcon />
//         )}
//       </TouchableOpacity>

//       <TextInput
//         style={[
//           styles.commentInput,
//           { borderColor: theme.primary + '40' },
//         ]}
//         placeholder="أضف تعليقاً…"
//         placeholderTextColor="#aaa"
//         value={text}
//         onChangeText={setText}
//         multiline
//         textAlign="right"
//         returnKeyType="send"
//         onSubmitEditing={submit}
//       />
//     </View>
//   );
// });

// interface CommentsSectionProps {
//   task: Task;
//   theme: any;
//   employeeId: number | string;
// }

// const CommentsSection = React.memo(({ task, theme, employeeId }: CommentsSectionProps) => {
//   const [comments, setComments] = useState<Task['comments']>(task.comments ?? []);
//   const scrollViewRef = useRef<ScrollView>(null);

//   const handleNewComment = useCallback((newComment: any) => {
//     if (!newComment || typeof newComment !== 'object' || Array.isArray(newComment)) return;
//     const normalized = {
//       ...newComment,
//       id: newComment.id ?? `temp-${Date.now()}`,
//     };
//     setComments((prev) => [...prev, normalized]);
//     setTimeout(() => {
//       scrollViewRef.current?.scrollToEnd({ animated: true });
//     }, 100);
//   }, []);

//   return (
//     <View style={[styles.commentsWrapper, { borderTopColor: theme.primary + '15' }]}>
//       <ScrollView
//         ref={scrollViewRef}
//         style={styles.commentsScrollView}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//       >
//         {comments.length > 0 ? (
//           <View style={styles.commentsList}>
//             {comments.map((c, index) => (
//               <CommentItem key={c.id ?? `comment-${index}`} comment={c} />
//             ))}
//           </View>
//         ) : (
//           <ThemedText style={styles.noComments}>لا توجد تعليقات بعد</ThemedText>
//         )}
//       </ScrollView>

//       <AddComment
//         taskId={task.id}
//         employeeId={employeeId}
//         onCommentAdded={handleNewComment}
//         theme={theme}
//       />
//     </View>
//   );
// });

// const TaskItem = React.memo(({ task, theme }: Props) => {
//   const { user } = useAuth() as any;
//   const employeeId = (user as any)?.employee?.id;

//   const [commentsOpen, setCommentsOpen] = useState(false);
//   const [mapVisible, setMapVisible] = useState(false);

//   const canCheckin = task.can_checkin === 1;
//   const commentCount = task.comments?.length ?? 0;

//   const toggleComments = useCallback(() => {
//     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
//     setCommentsOpen((p) => !p);
//   }, []);

//   const { mutate: doCheckin, isPending: checkinLoading } = useMutate<any>({
//     endpoint: `itineraries/${task.id}/checkin`,
//     mutationKey: ['checkin', task.id],
//     onSuccess: () => {
//       Alert.alert('✅', 'تم تسجيل الحضور بنجاح');
//     },
//   });

//   const handleCheckin = useCallback(() => {
//     if (!canCheckin || checkinLoading) return;
//     doCheckin({
//       employee_id: employeeId,
//       latitude: task.latitude,
//       longitude: task.longitude,
//     });
//   }, [canCheckin, checkinLoading, doCheckin, employeeId, task]);

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//       keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//     >
//       <View style={[styles.card, { backgroundColor: '#fff', borderColor: '#e4e6ea' }]}>
//         <View style={styles.postHeader}>
//           <View style={styles.postMeta}>
//             <ThemedText style={[styles.taskName, { color: theme.primary }]}>
//               {task.name}
//             </ThemedText>
//             <ThemedText style={styles.taskDate}>
//               {formatDate(task.created_at)}
//             </ThemedText>
//           </View>
//         </View>

//         {/* ── Post Body ── */}
//         {task.description ? (
//           <ThemedText style={styles.taskDescription}>{task.description}</ThemedText>
//         ) : null}

//         {commentCount > 0 && (
//           <TouchableOpacity onPress={toggleComments} activeOpacity={0.7}>
//             <View style={styles.statsRow}>
//               <ThemedText style={styles.statsText}>
//                 💬 {commentCount} {commentCount === 1 ? 'تعليق' : 'تعليقات'}
//               </ThemedText>
//             </View>
//           </TouchableOpacity>
//         )}

//         <View style={styles.divider} />

//         <View style={styles.actionsRow}>
//           <TouchableOpacity
//             style={[styles.actionBtn, commentsOpen && { backgroundColor: theme.primary + '12' }]}
//             onPress={toggleComments}
//             activeOpacity={0.7}
//           >
//             <CommentIcon />
//             <ThemedText style={[styles.actionLabel, { color: commentsOpen ? theme.primary : '#606770' }]}>
//               تعليق
//             </ThemedText>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={[styles.actionBtn, !canCheckin && styles.actionBtnDisabled]}
//             onPress={handleCheckin}
//             activeOpacity={canCheckin ? 0.7 : 1}
//             disabled={!canCheckin || checkinLoading}
//           >
//             {checkinLoading ? (
//               <ActivityIndicator size="small" color={theme.primary} />
//             ) : (
//               <CheckinIcon disabled={!canCheckin} />
//             )}
//             <ThemedText style={[styles.actionLabel, { color: canCheckin ? '#606770' : '#bbb' }]}>
//               تسجيل
//             </ThemedText>
//           </TouchableOpacity>

//           <TouchableOpacity
//             style={styles.actionBtn}
//             onPress={() => setMapVisible(true)}
//             activeOpacity={0.7}
//           >
//             <MapIcon />
//             <ThemedText style={[styles.actionLabel, { color: '#606770' }]}>
//               الموقع
//             </ThemedText>
//           </TouchableOpacity>
//         </View>

//         <TaskMapModal
//           visible={mapVisible}
//           onClose={() => setMapVisible(false)}
//           taskLatitude={task.latitude}
//           taskLongitude={task.longitude}
//           taskName={task.name}
//           theme={theme}
//         />

//         {commentsOpen && (
//           <CommentsSection
//             task={task}
//             theme={theme}
//             employeeId={employeeId}
//           />
//         )}
//       </View>
//     </KeyboardAvoidingView>
//   );
// });

// export default TaskItem;

// const styles = StyleSheet.create({
//   card: {
//     borderRadius: 10,
//     borderWidth: 1,
//     marginBottom: 10,
//     overflow: 'hidden',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     elevation: 2,
//   },
//   postHeader: {
//     flexDirection: 'row-reverse',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingTop: 12,
//     paddingBottom: 8,
//   },
//   avatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: 10,
//   },
//   avatarText: {
//     fontSize: 18,
//     fontFamily: APP_FONT_FAMILY,
//     fontWeight: '700',
//   },
//   postMeta: {
//     flex: 1,
//     alignItems: 'flex-end',
//   },
//   taskName: {
//     fontFamily: APP_FONT_FAMILY,
//     fontSize: 15,
//     textAlign: 'right',
//   },
//   taskDate: {
//     fontFamily: APP_FONT_FAMILY,
//     fontSize: 11,
//     color: '#8a8d91',
//     textAlign: 'right',
//     marginTop: 2,
//   },
//   taskDescription: {
//     fontFamily: APP_FONT_FAMILY,
//     fontSize: 14,
//     color: '#333',
//     textAlign: 'right',
//     lineHeight: 21,
//     paddingHorizontal: 12,
//     paddingBottom: 10,
//   },
//   statsRow: {
//     paddingHorizontal: 12,
//     paddingBottom: 6,
//     alignItems: 'flex-end',
//   },
//   statsText: {
//     fontFamily: APP_FONT_FAMILY,
//     fontSize: 12,
//     color: '#606770',
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#e4e6ea',
//   },
//   actionsRow: {
//     flexDirection: 'row-reverse',
//     justifyContent: 'space-around',
//     paddingVertical: 2,
//   },
//   actionBtn: {
//     flex: 1,
//     flexDirection: 'row-reverse',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 8,
//     borderRadius: 4,
//     gap: 6,
//   },
//   actionBtnDisabled: {
//     opacity: 0.45,
//   },
//   actionIcon: {
//     fontSize: 16,
//   },
//   actionLabel: {
//     fontFamily: APP_FONT_FAMILY,
//     fontSize: 13,
//     fontWeight: '600',
//   },
//   keyboardAvoidingView: {
//     flex: 1,
//   },
//   commentsWrapper: {
//     borderTopWidth: 1,
//     paddingTop: 8,
//     paddingHorizontal: 12,
//     paddingBottom: 4,
//   },
//   commentsScrollView: {
//     maxHeight: 200,
//   },
//   commentsList: {
//     marginBottom: 4,
//   },
//   noComments: {
//     fontFamily: APP_FONT_FAMILY,
//     fontSize: 12,
//     color: '#aaa',
//     textAlign: 'center',
//     paddingVertical: 8,
//   },
//   addCommentRow: {
//     flexDirection: 'row-reverse',
//     alignItems: 'center',
//     borderTopWidth: 1,
//     paddingTop: 8,
//     gap: 8,
//     marginTop: 4,
//   },
//   commentInput: {
//     flex: 1,
//     fontFamily: APP_FONT_FAMILY,
//     fontSize: 13,
//     borderWidth: 1,
//     borderRadius: 20,
//     paddingHorizontal: 14,
//     paddingVertical: Platform.OS === 'ios' ? 8 : 4,
//     backgroundColor: '#f0f2f5',
//     textAlign: 'right',
//     maxHeight: 100,
//     color: '#222', // اللون الأسود الثابت للنص
//   },
//   sendBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   sendIcon: {
//     fontSize: 14,
//     color: '#fff',
//     transform: [{ scaleX: I18nManager.isRTL ? 1 : -1 }],
//   },
// });

import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  ActivityIndicator,
  I18nManager,
  Alert,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import APP_FONT_FAMILY from '@/components/styles/font';
import CommentItem from './CommentItem';
import { Task } from './types';
import { useAuth } from '@/hooks/useAuth';
import { useMutate } from '@/hooks/useMutate';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import TaskMapModal from './Taskmapmodal';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface Props {
  task: Task;
  theme: any;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

const CommentIcon = () => <ThemedText style={styles.actionIcon}>💬</ThemedText>;

const CheckinIcon = ({ disabled }: { disabled: boolean }) => (
  <ThemedText style={[styles.actionIcon, disabled && { opacity: 0.35 }]}>📍</ThemedText>
);

const SendIcon = () => <ThemedText style={styles.sendIcon}>➤</ThemedText>;

const MapIcon = () => (
  <MaterialCommunityIcons name="map-marker-radius-outline" size={22} color="#333" />
);

interface AddCommentProps {
  taskId: number;
  employeeId: number | string;
  onCommentAdded: (newComment: any) => void;
  theme: any;
}

const AddComment = React.memo(({ taskId, employeeId, onCommentAdded, theme }: AddCommentProps) => {
  const [text, setText] = useState('');

  const { mutate: postComment, isPending } = useMutate<any>({
    endpoint: `task-comments/${taskId}`,
    mutationKey: ['task-comments', taskId],
    onSuccess: (response) => {
      setText('');
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
    <View style={[styles.addCommentRow, { borderTopColor: theme.primary + '20' }]}>
      <TouchableOpacity
        onPress={submit}
        disabled={isPending || !text.trim()}
        style={[
          styles.sendBtn,
          { backgroundColor: theme.primary },
          (isPending || !text.trim()) && { opacity: 0.5 },
        ]}
        activeOpacity={0.8}
      >
        {isPending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <SendIcon />
        )}
      </TouchableOpacity>

      <TextInput
        style={[styles.commentInput, { borderColor: theme.primary + '40' }]}
        placeholder="أضف تعليقاً…"
        placeholderTextColor="#aaa"
        value={text}
        onChangeText={setText}
        multiline
        textAlign="right"
        returnKeyType="send"
        onSubmitEditing={submit}
      />
    </View>
  );
});

interface CommentsSectionProps {
  task: Task;
  theme: any;
  employeeId: number | string;
}

const CommentsSection = React.memo(({ task, theme, employeeId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Task['comments']>(task.comments ?? []);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleNewComment = useCallback((newComment: any) => {
    if (!newComment || typeof newComment !== 'object' || Array.isArray(newComment)) return;
    const normalized = {
      ...newComment,
      id: newComment.id ?? `temp-${Date.now()}`,
    };
    setComments((prev) => [...prev, normalized]);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  return (
    <View style={[styles.commentsWrapper, { borderTopColor: theme.primary + '15' }]}>
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
          <ThemedText style={styles.noComments}>لا توجد تعليقات بعد</ThemedText>
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
});

// ─────────────────────────────────────────────
// TaskItem - بدون KeyboardAvoidingView
// الـ keyboard handling بيتم على مستوى الشاشة في TasksScreen
// ─────────────────────────────────────────────
const TaskItem = React.memo(({ task, theme }: Props) => {
  const { user } = useAuth() as any;
  const employeeId = (user as any)?.employee?.id;

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  const canCheckin = task.can_checkin === 1;
  const commentCount = task.comments?.length ?? 0;

  const toggleComments = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCommentsOpen((p) => !p);
  }, []);

  const { mutate: doCheckin, isPending: checkinLoading } = useMutate<any>({
    endpoint: `itineraries/${task.id}/checkin`,
    mutationKey: ['checkin', task.id],
    onSuccess: () => {
      Alert.alert('✅', 'تم تسجيل الحضور بنجاح');
    },
  });

  const handleCheckin = useCallback(() => {
    if (!canCheckin || checkinLoading) return;
    doCheckin({
      employee_id: employeeId,
      latitude: task.latitude,
      longitude: task.longitude,
    });
  }, [canCheckin, checkinLoading, doCheckin, employeeId, task]);

  return (
    <View style={[styles.card, { backgroundColor: '#fff', borderColor: '#e4e6ea' }]}>
      {/* ── Header ── */}
      <View style={styles.postHeader}>
        <View style={styles.postMeta}>
          <ThemedText style={[styles.taskName, { color: theme.primary }]}>
            {task.name}
          </ThemedText>
          <ThemedText style={styles.taskDate}>{formatDate(task.created_at)}</ThemedText>
        </View>
      </View>

      {/* ── Description ── */}
      {task.description ? (
        <ThemedText style={styles.taskDescription}>{task.description}</ThemedText>
      ) : null}

      {/* ── عدد التعليقات ── */}
      {commentCount > 0 && (
        <TouchableOpacity onPress={toggleComments} activeOpacity={0.7}>
          <View style={styles.statsRow}>
            <ThemedText style={styles.statsText}>
              💬 {commentCount} {commentCount === 1 ? 'تعليق' : 'تعليقات'}
            </ThemedText>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.divider} />

      {/* ── Actions ── */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, commentsOpen && { backgroundColor: theme.primary + '12' }]}
          onPress={toggleComments}
          activeOpacity={0.7}
        >
          <CommentIcon />
          <ThemedText
            style={[styles.actionLabel, { color: commentsOpen ? theme.primary : '#606770' }]}
          >
            تعليق
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, !canCheckin && styles.actionBtnDisabled]}
          onPress={handleCheckin}
          activeOpacity={canCheckin ? 0.7 : 1}
          disabled={!canCheckin || checkinLoading}
        >
          {checkinLoading ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <CheckinIcon disabled={!canCheckin} />
          )}
          <ThemedText style={[styles.actionLabel, { color: canCheckin ? '#606770' : '#bbb' }]}>
            تسجيل
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => setMapVisible(true)}
          activeOpacity={0.7}
        >
          <MapIcon />
          <ThemedText style={[styles.actionLabel, { color: '#606770' }]}>الموقع</ThemedText>
        </TouchableOpacity>
      </View>

      {/* ── Map Modal ── */}
      <TaskMapModal
        visible={mapVisible}
        onClose={() => setMapVisible(false)}
        taskLatitude={task.latitude}
        taskLongitude={task.longitude}
        taskName={task.name}
        theme={theme}
      />

      {/* ── Comments ── */}
      {commentsOpen && (
        <CommentsSection task={task} theme={theme} employeeId={employeeId} />
      )}
    </View>
  );
});

export default TaskItem;

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  postMeta: {
    flex: 1,
    alignItems: 'flex-end',
  },
  taskName: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 15,
    textAlign: 'right',
  },
  taskDate: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 11,
    color: '#8a8d91',
    textAlign: 'right',
    marginTop: 2,
  },
  taskDescription: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    color: '#333',
    textAlign: 'right',
    lineHeight: 21,
    paddingHorizontal: 12,
    paddingBottom: 10,
  },
  statsRow: {
    paddingHorizontal: 12,
    paddingBottom: 6,
    alignItems: 'flex-end',
  },
  statsText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: '#606770',
  },
  divider: {
    height: 1,
    backgroundColor: '#e4e6ea',
  },
  actionsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    paddingVertical: 2,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 4,
    gap: 6,
  },
  actionBtnDisabled: {
    opacity: 0.45,
  },
  actionIcon: {
    fontSize: 16,
  },
  actionLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    fontWeight: '600',
  },
  commentsWrapper: {
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 12,
    paddingBottom: 4,
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
    color: '#aaa',
    textAlign: 'center',
    paddingVertical: 8,
  },
  addCommentRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 8,
    marginTop: 4,
  },
  commentInput: {
    flex: 1,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    backgroundColor: '#f0f2f5',
    textAlign: 'right',
    maxHeight: 100,
    color: '#222',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    fontSize: 14,
    color: '#fff',
    transform: [{ scaleX: I18nManager.isRTL ? 1 : -1 }],
  },
});