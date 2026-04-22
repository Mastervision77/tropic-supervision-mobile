// import APP_FONT_FAMILY from "@/components/styles/font";
// import { ThemedText } from "@/components/themed-text";
// import { ThemedView } from "@/components/themed-view";
// import { Colors } from "@/constants/theme";
// import useFetch from "@/hooks/useFetch";
// import { useMutate } from "@/hooks/useMutate";
// import { Ionicons } from "@expo/vector-icons";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import React, { useCallback, useEffect, useRef, useState } from "react";
// import {
//   ActivityIndicator,
//   FlatList,
//   KeyboardAvoidingView,
//   Platform,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";

// const PRIMARY = Colors.light.secondary;

// const ICON_BG = Colors.light.primary;

// interface Sender {
//   id: number;
//   name: string;
// }

// interface Message {
//   id: number;
//   itinerary_id: number;
//   sender_employee_id: number;
//   receiver_employee_id: number;
//   status: string;
//   direction: "send" | "receive";
//   message: string;
//   created_at: string;
//   read_at: string | null;
//   edited_at: string | null;
//   sender: Sender;
//   receiver: Sender;
// }

// interface ApiResponse {
//   data: Message[];
// }

// function formatTime(dateStr: string) {
//   const date = new Date(dateStr);
//   return date.toLocaleTimeString("ar-EG", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// const MessageBubble = React.memo(({ item }: { item: Message }) => {
//   const isMe = item.direction === "receive";

//   return (
//     <View
//       style={[
//         styles.bubbleWrapper,
//         isMe ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
//       ]}
//     >
//       {!isMe && (
//         <View style={styles.bubbleAvatar}>
//           <Text style={styles.bubbleAvatarText}>
//             {item.sender.name.charAt(0).toUpperCase()}
//           </Text>
//         </View>
//       )}
//       <View
//         style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
//       >
//         {!isMe && (
//           <Text style={styles.bubbleSenderName}>{item.sender.name}</Text>
//         )}
//         <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
//           {item.message}
//         </Text>
//         <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
//           {formatTime(item.created_at)}
//           {isMe && <Text> </Text>}
//           {isMe && (
//             <Ionicons
//               name={item.read_at ? "checkmark-done" : "checkmark-done-outline"}
//               size={12}
//               color={item.read_at ? "#a78fc4" : "rgba(255,255,255,0.6)"}
//             />
//           )}
//         </Text>
//       </View>
//     </View>
//   );
// });

// export default function ConversationScreen() {
//   const { id, chatId } = useLocalSearchParams<{ id: string; chatId: string }>();
//   const router = useRouter();
//   const flatListRef = useRef<FlatList>(null);
//   const isFirstLoad = useRef(true);
//   const [messageText, setMessageText] = useState("");
//   const [localMessages, setLocalMessages] = useState<Message[]>([]);

//   useEffect(() => {
//     if (localMessages.length === 0) return;
//     setTimeout(() => {
//       flatListRef.current?.scrollToEnd({ animated: !isFirstLoad.current });
//       isFirstLoad.current = false;
//     }, 100);
//   }, [localMessages]);

//   const { data, isLoading, isError } = useFetch<ApiResponse>({
//     endpoint: `umrah/emergency-chat?itinerary_id=${id}&employee_id=${chatId}`,
//     queryKey: ["conversation", id, chatId],
//     enabled: !!id && !!chatId,
//     refetchInterval: 5000,
//     onSuccess: (data) => {
//       setLocalMessages(data?.data || []);
//     },
//   });

//   const { mutate: sendMessage, isPending: isSending } = useMutate<any>({
//     endpoint: "umrah/emergency-chat",
//     mutationKey: ["send-message", id, chatId],
//     onSuccess: (res) => {
//       const newMsg: Message = res?.data;
//       if (newMsg) {
//         setLocalMessages((prev) => [...prev, newMsg]);
//       }
//       setMessageText("");
//     },
//   });

//   const handleSend = useCallback(() => {
//     const trimmed = messageText.trim();
//     if (!trimmed || isSending) return;

//     sendMessage({
//       itinerary_id: Number(id),
//       receiver_employee_id: Number(chatId),
//       message: trimmed,
//     });
//   }, [messageText, isSending, id, chatId, sendMessage]);

//   const renderItem = useCallback(
//     ({ item }: { item: Message }) => <MessageBubble item={item} />,
//     [],
//   );

//   return (
//     <SafeAreaView style={styles.root} edges={["top"]}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
//           <Ionicons name="arrow-forward" size={22} color="#fff" />
//         </TouchableOpacity>
//         <View style={styles.headerTexts}>
//           <Text style={styles.headerTitle}>المحادثة</Text>
//         </View>
//       </View>

//       <KeyboardAvoidingView
//         style={styles.flex}
//         behavior={Platform.OS === "ios" ? "padding" : "height"}
//         keyboardVerticalOffset={0}
//       >
//         <ThemedView style={styles.body}>
//           {isLoading ? (
//             <View style={styles.center}>
//               <ActivityIndicator size="large" color={PRIMARY} />
//             </View>
//           ) : isError ? (
//             <View style={styles.center}>
//               <ThemedText style={styles.errorText}>
//                 حدث خطأ أثناء تحميل المحادثة
//               </ThemedText>
//             </View>
//           ) : (
//             <FlatList
//               ref={flatListRef}
//               data={localMessages}
//               keyExtractor={(item) => item.id.toString()}
//               renderItem={renderItem}
//               contentContainerStyle={styles.listContent}
//               showsVerticalScrollIndicator={false}
//             />
//           )}

//           <View style={styles.inputRow}>
//             <TouchableOpacity
//               style={[
//                 styles.sendBtn,
//                 (!messageText.trim() || isSending) && styles.sendBtnDisabled,
//               ]}
//               onPress={handleSend}
//               disabled={!messageText.trim() || isSending}
//               activeOpacity={0.8}
//             >
//               {isSending ? (
//                 <ActivityIndicator size="small" color="#fff" />
//               ) : (
//                 <Ionicons name="send" size={18} color="#fff" />
//               )}
//             </TouchableOpacity>

//             <TextInput
//               style={styles.textInput}
//               value={messageText}
//               onChangeText={setMessageText}
//               placeholder="اكتب رسالة..."
//               placeholderTextColor="#bbb"
//               multiline
//               textAlign="right"
//               onSubmitEditing={handleSend}
//             />
//           </View>
//         </ThemedView>
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   flex: { flex: 1 },

//   root: {
//     flex: 1,
//     backgroundColor: PRIMARY,
//   },

//   header: {
//     backgroundColor: PRIMARY,
//     paddingHorizontal: 20,
//     paddingTop: 12,
//     paddingBottom: 24,
//     flexDirection: "row",
//     alignItems: "flex-end",
//     justifyContent: "space-between",
//   },
//   headerTexts: {
//     alignItems: "flex-end",
//   },
//   headerTitle: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "600",
//     fontFamily: APP_FONT_FAMILY,
//     textAlign: "right",
//   },
//   headerSub: {
//     color: "rgba(255,255,255,0.6)",
//     fontSize: 12,
//     fontFamily: APP_FONT_FAMILY,
//     textAlign: "right",
//     marginTop: 2,
//   },
//   backBtn: {
//     width: 36,
//     height: 36,
//     borderRadius: 10,
//     backgroundColor: "rgba(255,255,255,0.15)",
//     alignItems: "center",
//     justifyContent: "center",
//     alignSelf: "flex-start",
//   },

//   body: {
//     flex: 1,
//     backgroundColor: "#f5f3f7",
//   },
//   listContent: {
//     padding: 16,
//     paddingBottom: 8,
//     gap: 10,
//   },

//   bubbleWrapper: {
//     flexDirection: "row-reverse",
//     alignItems: "flex-end",
//     gap: 8,
//     maxWidth: "80%",
//   },
//   bubbleWrapperRight: {
//     alignSelf: "flex-start",
//     flexDirection: "row-reverse",
//   },
//   bubbleWrapperLeft: {
//     alignSelf: "flex-start",
//   },
//   bubbleAvatar: {
//     width: 30,
//     height: 30,
//     borderRadius: 99,
//     backgroundColor: ICON_BG,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: "rgba(80,13,117,0.15)",
//     flexShrink: 0,
//   },
//   bubbleAvatarText: {
//     fontSize: 12,
//     fontWeight: "600",
//     color: PRIMARY,
//     fontFamily: APP_FONT_FAMILY,
//   },
//   bubble: {
//     borderRadius: 16,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     gap: 4,
//   },
//   bubbleMe: {
//     backgroundColor: PRIMARY,
//     borderBottomRightRadius: 4,
//   },
//   bubbleOther: {
//     backgroundColor: "#fff",
//     borderBottomLeftRadius: 4,
//     borderWidth: 0.5,
//     borderColor: "rgba(80,13,117,0.1)",
//     shadowColor: PRIMARY,
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   bubbleSenderName: {
//     fontSize: 11,
//     fontWeight: "600",
//     color: PRIMARY,
//     fontFamily: APP_FONT_FAMILY,
//     marginBottom: 2,
//   },
//   bubbleText: {
//     fontSize: 14,
//     color: "#1a1a1a",
//     fontFamily: APP_FONT_FAMILY,
//     textAlign: "right",
//     lineHeight: 20,
//   },
//   bubbleTextMe: {
//     color: "#fff",
//   },
//   bubbleTime: {
//     fontSize: 10,
//     color: "#aaa",
//     fontFamily: APP_FONT_FAMILY,
//     textAlign: "left",
//     marginTop: 2,
//   },
//   bubbleTimeMe: {
//     color: "rgba(255,255,255,0.6)",
//     textAlign: "right",
//   },

//   inputRow: {
//     flexDirection: "row-reverse",
//     alignItems: "flex-end",
//     gap: 10,
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     backgroundColor: "#fff",
//     borderTopWidth: 0.5,
//     borderTopColor: "rgba(80,13,117,0.1)",
//   },
//   textInput: {
//     flex: 1,
//     minHeight: 42,
//     maxHeight: 100,
//     backgroundColor: "#f5f3f7",
//     borderRadius: 12,
//     paddingHorizontal: 14,
//     paddingVertical: 10,
//     fontSize: 14,
//     fontFamily: APP_FONT_FAMILY,
//     color: "#1a1a1a",
//     borderWidth: 0.5,
//     borderColor: "rgba(80,13,117,0.12)",
//     textAlignVertical: "center",
//   },
//   sendBtn: {
//     width: 42,
//     height: 42,
//     borderRadius: 12,
//     backgroundColor: PRIMARY,
//     alignItems: "center",
//     justifyContent: "center",
//     flexShrink: 0,
//   },
//   sendBtnDisabled: {
//     opacity: 0.4,
//   },

//   center: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 12,
//   },
//   errorText: {
//     color: "red",
//     fontFamily: APP_FONT_FAMILY,
//     textAlign: "right",
//     fontSize: 14,
//   },
// });
import APP_FONT_FAMILY from "@/components/styles/font";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import useFetch from "@/hooks/useFetch";
import { useMutate } from "@/hooks/useMutate";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = Colors.light.secondary;
const ICON_BG = Colors.light.primary;

interface Sender {
  id: number;
  name: string;
}

interface Message {
  id: number;
  itinerary_id: number;
  sender_employee_id: number;
  receiver_employee_id: number;
  status: string;
  direction: "send" | "receive";
  message: string;
  created_at: string;
  read_at: string | null;
  edited_at: string | null;
  sender: Sender;
  receiver: Sender;
}

interface ApiResponse {
  data: Message[];
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const MessageBubble = React.memo(({ item }: { item: Message }) => {
  // "send" = أنا بعتها → تظهر على اليمين
  // "receive" = الطرف التاني → تظهر على الشمال
  const isMe = item.direction === "send";

  return (
    <View
      style={[
        styles.bubbleWrapper,
        isMe ? styles.bubbleWrapperRight : styles.bubbleWrapperLeft,
      ]}
    >
      {/* الأفاتار بيظهر بس للرسايل الواردة */}
      {!isMe && (
        <View style={styles.bubbleAvatar}>
          <Text style={styles.bubbleAvatarText}>
            {item.sender.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View
        style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
      >
        {/* اسم المرسل بيظهر بس للرسايل الواردة */}
        {!isMe && (
          <Text style={styles.bubbleSenderName}>{item.sender.name}</Text>
        )}

        <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>
          {item.message}
        </Text>

        <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeMe]}>
          {formatTime(item.created_at)}
          {isMe && (
            <>
              <Text> </Text>
              <Ionicons
                name={item.read_at ? "checkmark-done" : "checkmark-done-outline"}
                size={12}
                color={item.read_at ? "#a78fc4" : "rgba(255,255,255,0.6)"}
              />
            </>
          )}
        </Text>
      </View>
    </View>
  );
});

export default function ConversationScreen() {
  const { id, chatId } = useLocalSearchParams<{ id: string; chatId: string }>();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const isFirstLoad = useRef(true);
  const [messageText, setMessageText] = useState("");
  const [localMessages, setLocalMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (localMessages.length === 0) return;
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: !isFirstLoad.current });
      isFirstLoad.current = false;
    }, 100);
  }, [localMessages]);

  const { data, isLoading, isError } = useFetch<ApiResponse>({
    endpoint: `umrah/emergency-chat?itinerary_id=${id}&employee_id=${chatId}`,
    queryKey: ["conversation", id, chatId],
    enabled: !!id && !!chatId,
    refetchInterval: 5000,
    onSuccess: (data) => {
      setLocalMessages(data?.data || []);
    },
  });

  const { mutate: sendMessage, isPending: isSending } = useMutate<any>({
    endpoint: "umrah/emergency-chat",
    mutationKey: ["send-message", id, chatId],
    onSuccess: (res) => {
      const newMsg: Message = res?.data;
      if (newMsg) {
        setLocalMessages((prev) => [...prev, newMsg]);
      }
      setMessageText("");
    },
  });

  const handleSend = useCallback(() => {
    const trimmed = messageText.trim();
    if (!trimmed || isSending) return;

    sendMessage({
      itinerary_id: Number(id),
      receiver_employee_id: Number(chatId),
      message: trimmed,
    });
  }, [messageText, isSending, id, chatId, sendMessage]);

  const renderItem = useCallback(
    ({ item }: { item: Message }) => <MessageBubble item={item} />,
    [],
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.headerTitle}>المحادثة</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ThemedView style={styles.body}>
          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={PRIMARY} />
            </View>
          ) : isError ? (
            <View style={styles.center}>
              <ThemedText style={styles.errorText}>
                حدث خطأ أثناء تحميل المحادثة
              </ThemedText>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={localMessages}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}

          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[
                styles.sendBtn,
                (!messageText.trim() || isSending) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!messageText.trim() || isSending}
              activeOpacity={0.8}
            >
              {isSending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="send" size={18} color="#fff" />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              value={messageText}
              onChangeText={setMessageText}
              placeholder="اكتب رسالة..."
              placeholderTextColor="#bbb"
              multiline
              textAlign="right"
              onSubmitEditing={handleSend}
            />
          </View>
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  root: {
    flex: 1,
    backgroundColor: PRIMARY,
  },

  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  headerTexts: {
    alignItems: "flex-end",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: APP_FONT_FAMILY,
    textAlign: "right",
  },
  headerSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontFamily: APP_FONT_FAMILY,
    textAlign: "right",
    marginTop: 2,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
  },

  body: {
    flex: 1,
    backgroundColor: "#f5f3f7",
  },
  listContent: {
    padding: 16,
    paddingBottom: 8,
    gap: 10,
  },

  // ── Bubble wrapper ──────────────────────────────────────────
  bubbleWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "80%",
  },
  // رسايلي → على اليمين
  bubbleWrapperRight: {
    alignSelf: "flex-end",
    flexDirection: "row",          // أيقونة الـ checkmark بعد الفقاعة
  },
  // رسايل الطرف التاني → على الشمال
  bubbleWrapperLeft: {
    alignSelf: "flex-start",
    flexDirection: "row",          // الأفاتار قبل الفقاعة
  },

  bubbleAvatar: {
    width: 30,
    height: 30,
    borderRadius: 99,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(80,13,117,0.15)",
    flexShrink: 0,
  },
  bubbleAvatarText: {
    fontSize: 12,
    fontWeight: "600",
    color: PRIMARY,
    fontFamily: APP_FONT_FAMILY,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  // فقاعة رسايلي (بنفسجي، زاوية يمين سفلي مربعة)
  bubbleMe: {
    backgroundColor: PRIMARY,
    borderBottomRightRadius: 4,
  },
  // فقاعة الطرف التاني (أبيض، زاوية شمال سفلي مربعة)
  bubbleOther: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: "rgba(80,13,117,0.1)",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  bubbleSenderName: {
    fontSize: 11,
    fontWeight: "600",
    color: PRIMARY,
    fontFamily: APP_FONT_FAMILY,
    marginBottom: 2,
  },
  bubbleText: {
    fontSize: 14,
    color: "#1a1a1a",
    fontFamily: APP_FONT_FAMILY,
    textAlign: "right",
    lineHeight: 20,
  },
  bubbleTextMe: {
    color: "#fff",
  },
  bubbleTime: {
    fontSize: 10,
    color: "#aaa",
    fontFamily: APP_FONT_FAMILY,
    textAlign: "left",
    marginTop: 2,
  },
  bubbleTimeMe: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "right",
  },

  // ── Input row ───────────────────────────────────────────────
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "rgba(80,13,117,0.1)",
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 100,
    backgroundColor: "#f5f3f7",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: APP_FONT_FAMILY,
    color: "#1a1a1a",
    borderWidth: 0.5,
    borderColor: "rgba(80,13,117,0.12)",
    textAlignVertical: "center",
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  errorText: {
    color: "red",
    fontFamily: APP_FONT_FAMILY,
    textAlign: "right",
    fontSize: 14,
  },
});