import APP_FONT_FAMILY from "@/components/styles/font";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import useFetch from "@/hooks/useFetch";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = Colors.light.secondary;

const ICON_BG = Colors.light.primary;

interface Chat {
  id: number;
  name: string;
  last_message: string;
  last_message_at: string;
  last_message_sender: "you" | "other";
}

interface ApiResponse {
  data: Chat[];
}

interface Employee {
  id: number;
  name: string;
  email: string;
  department_name?: string;
}

interface EmployeesApiResponse {
  data: {
    data: Employee[];
  };
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ChatItem = React.memo(
  ({ item, onPress }: { item: Chat; onPress: (id: number) => void }) => {
    const isYou = item.last_message_sender === "you";

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => onPress(item.id)}
        activeOpacity={0.75}
      >
        <View style={styles.avatar}></View>
        <View style={styles.chatContent}>
          <View style={styles.chatTopRow}>
            <Text style={styles.chatTime}>
              {formatTime(item.last_message_at)}
            </Text>
            <Text style={styles.chatName}>{item.name}</Text>
          </View>
          <View style={styles.chatBottomRow}>
            {isYou && (
              <Ionicons
                name="checkmark-done-outline"
                size={14}
                color="#888"
                style={styles.sentIcon}
              />
            )}
            <Text style={styles.lastMessage} numberOfLines={1}>
              {isYou ? `أنت: ${item.last_message}` : item.last_message}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

interface EmployeeModalProps {
  visible: boolean;
  onClose: () => void;
  itineraryId: string;
  onSuccess: () => void;
}

function EmployeeSelectModal({
  visible,
  onClose,
  itineraryId,
  onSuccess,
}: EmployeeModalProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: empData, isLoading: empLoading } =
    useFetch<EmployeesApiResponse>({
      endpoint: "master-data/employees",
      queryKey: ["employees-for-chat"],
      enabled: visible,
    });

  const employees: Employee[] = empData?.data?.data ?? [];

  function startChat() {
    router.push(`/Chat/${itineraryId}/conversation/${selectedId}` as any);
    onClose();
    // refetch();
  }

  const handleClose = () => {
    setSelectedId(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose} hitSlop={12}>
              <Ionicons name="close" size={22} color="#888" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>اختر موظفاً للمحادثة</Text>
          </View>

          {empLoading ? (
            <ActivityIndicator
              size="large"
              color={PRIMARY}
              style={{ marginVertical: 40 }}
            />
          ) : (
            <FlatList
              data={employees}
              keyExtractor={(item) => item.id.toString()}
              style={{ maxHeight: 380 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = selectedId === item.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.employeeRow,
                      isSelected && styles.employeeRowSelected,
                    ]}
                    onPress={() => setSelectedId(item.id)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.empInfo}>
                      <Text style={styles.empName}>{item.name}</Text>
                      {!!item.department_name && (
                        <Text style={styles.empDept}>
                          {item.department_name}
                        </Text>
                      )}
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={PRIMARY}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={{ paddingVertical: 24, alignItems: "center" }}>
                  <Text style={styles.emptyText}>لا يوجد موظفون</Text>
                </View>
              }
            />
          )}

          <TouchableOpacity
            style={[styles.chatBtn, !selectedId && styles.chatBtnDisabled]}
            onPress={() => startChat()}
            disabled={!selectedId}
            activeOpacity={0.85}
          >
            <>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={18}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
              <Text style={styles.chatBtnText}>محادثة</Text>
            </>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  const { data, isLoading, isError, refetch } = useFetch<ApiResponse>({
    endpoint: `umrah/get-chats?itinerary_id=${id}`,
    queryKey: ["chats", id],
    enabled: !!id,
  });

  const handleOpenConversation = useCallback(
    (chatId: number) => {
      router.push(`/Chat/${id}/conversation/${chatId}` as any);
      refetch();
    },
    [router, id],
  );

  const renderItem = useCallback(
    ({ item }: { item: Chat }) => (
      <ChatItem item={item} onPress={handleOpenConversation} />
    ),
    [handleOpenConversation],
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-forward" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTexts}>
          <Text style={styles.headerSub}>المحادثات</Text>
        </View>
      </View>

      <ThemedView style={styles.body}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <ThemedText style={styles.errorText}>
              حدث خطأ أثناء تحميل المحادثات
            </ThemedText>
          </View>
        ) : !data?.data?.length ? (
          <View style={styles.center}>
            <Ionicons name="chatbubbles-outline" size={48} color="#ddd" />
            <Text style={styles.emptyText}>لا توجد محادثات بعد</Text>
          </View>
        ) : (
          <FlatList
            data={data.data}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.85}
        >
          <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
        </TouchableOpacity>
      </ThemedView>

      <EmployeeSelectModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        itineraryId={id}
        onSuccess={() => refetch()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PRIMARY,
  },

  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 48,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  headerTexts: {
    alignItems: "flex-end",
  },
  headerSub: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginBottom: 4,
    fontFamily: APP_FONT_FAMILY,
    textAlign: "right",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },

  body: {
    flex: 1,
    backgroundColor: "#f5f3f7",
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  chatItem: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
    borderWidth: 0.5,
    borderColor: "rgba(80,13,117,0.08)",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  separator: {
    height: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 99,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "rgba(80,13,117,0.15)",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: PRIMARY,
    fontFamily: APP_FONT_FAMILY,
  },
  chatContent: {
    flex: 1,
    gap: 5,
  },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chatName: {
    fontSize: 15,
    fontWeight: "500",
    color: "#1a1a1a",
    fontFamily: APP_FONT_FAMILY,
    textAlign: "right",
  },
  chatTime: {
    fontSize: 11,
    color: "#aaa",
    fontFamily: APP_FONT_FAMILY,
  },
  chatBottomRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  lastMessage: {
    flex: 1,
    fontSize: 13,
    color: "#888",
    fontFamily: APP_FONT_FAMILY,
    textAlign: "right",
  },
  sentIcon: {
    flexShrink: 0,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: "#bbb",
    fontFamily: APP_FONT_FAMILY,
    textAlign: "center",
  },
  errorText: {
    color: "red",
    fontFamily: APP_FONT_FAMILY,
    textAlign: "right",
    fontSize: 14,
  },

  fab: {
    position: "absolute",
    bottom: 28,
    left: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: APP_FONT_FAMILY,
    color: "#1a1a1a",
  },

  employeeRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#f8f5fb",
  },
  employeeRowSelected: {
    backgroundColor: ICON_BG,
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  empAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    flexShrink: 0,
  },
  empAvatarSelected: {
    backgroundColor: PRIMARY,
  },
  empAvatarText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#555",
    fontFamily: APP_FONT_FAMILY,
  },
  empInfo: {
    flex: 1,
  },
  empName: {
    fontSize: 14,
    fontFamily: APP_FONT_FAMILY,
    color: "#1a1a1a",
    textAlign: "right",
  },
  empDept: {
    fontSize: 12,
    color: "#999",
    fontFamily: APP_FONT_FAMILY,
    marginTop: 2,
    textAlign: "right",
  },

  chatBtn: {
    marginTop: 16,
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  chatBtnDisabled: {
    backgroundColor: "#c0a0d8",
  },
  chatBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: APP_FONT_FAMILY,
    fontWeight: "700",
  },
});
