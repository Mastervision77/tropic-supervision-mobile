import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import APP_FONT_FAMILY from "@/components/styles/font";
import { useAuth } from "@/hooks/useAuth";
import useFetch from "@/hooks/useFetch";
import { useMutate } from "@/hooks/useMutate";
import { useQueryClient } from "@tanstack/react-query";
import { Colors } from "@/constants/theme";

const PRIMARY = Colors.light.secondary;
const ICON_BG = Colors.light.primary;
const BORDER = "rgba(80,13,117,0.12)";

interface Wallet {
  id: number;
  amount: string | number;
  employee_name: string;
}
interface WalletResponse {
  data: { data: Wallet[] };
}

interface Itinerary {
  id: number;
  name: string;
}
interface ItineraryResponse {
  data: Itinerary[];
}

interface ExpenditureItem {
  id: number;
  name: string;
  max_amount: number;
  total_expenses: string;
  created_at: string;
  updated_at: string;
}
interface ExpenditureResponse {
  data: { data: ExpenditureItem[] };
}

/* ─── Section Label ──────────────────────────────────────── */
const SectionLabel = React.memo(
  ({
    icon,
    label,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }) => (
    <View style={styles.sectionLabel}>
      <Text style={styles.sectionLabelText}>{label}</Text>
      <View style={styles.sectionIconWrap}>
        <Ionicons name={icon} size={15} color={PRIMARY} />
      </View>
    </View>
  ),
);

/* ─── Itinerary Select ───────────────────────────────────── */
const ItinerarySelect = React.memo(
  ({
    items,
    selected,
    onSelect,
  }: {
    items: Itinerary[];
    selected: number | null;
    onSelect: (id: number) => void;
  }) => (
    <View style={styles.selectGrid}>
      {items.map((item) => {
        const active = selected === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.selectItem, active && styles.selectItemActive]}
            onPress={() => onSelect(item.id)}
            activeOpacity={0.75}
          >
            <View style={styles.selectItemInner}>
              <View
                style={[styles.selectRadio, active && styles.selectRadioActive]}
              >
                {active && <View style={styles.selectRadioDot} />}
              </View>
              <Text
                style={[
                  styles.selectItemText,
                  active && styles.selectItemTextActive,
                ]}
                numberOfLines={2}
              >
                {item.name}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  ),
);

/* ─── Expenditure Select ─────────────────────────────────── */
const ExpenditureSelect = React.memo(
  ({
    items,
    selected,
    onSelect,
  }: {
    items: ExpenditureItem[];
    selected: number | null;
    onSelect: (id: number) => void;
  }) => (
    <View style={styles.expGrid}>
      {items.map((item) => {
        const active = selected === item.id;
        return (
          <TouchableOpacity
            key={item.id}
            style={[styles.expItem, active && styles.expItemActive]}
            onPress={() => onSelect(item.id)}
            activeOpacity={0.75}
          >
            {active && (
              <View style={styles.checkBadge}>
                <Ionicons name="checkmark" size={10} color="#fff" />
              </View>
            )}
            <Text
              style={[styles.expItemText, active && styles.expItemTextActive]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
            <Text
              style={[styles.expItemSub, active && styles.expItemSubActive]}
              numberOfLines={1}
            >
              {Number(item.max_amount).toLocaleString("en-US")} ر.س
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  ),
);

/* ─── Main Screen ────────────────────────────────────────── */
export default function SpendScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const employeeId = (user as any)?.employee?.id;

  const [selectedItinerary, setSelectedItinerary] = useState<number | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  /* ── Fetches ── */
  const { data: walletData, isLoading: walletLoading } =
    useFetch<WalletResponse>({
      queryKey: ["employee-wallets", employeeId],
      endpoint: `master-data/employee-wallets?employee_id=${employeeId}`,
      enabled: !!employeeId,
    });

  const { data: itineraryData, isLoading: itineraryLoading } =
    useFetch<ItineraryResponse>({
      queryKey: ["itineraries", "employee", employeeId],
      endpoint: `itinerary?employee_id=${employeeId}`,
      enabled: !!employeeId,
    });

  const { data: itemsData, isLoading: itemsLoading } =
    useFetch<ExpenditureResponse>({
      queryKey: ["expenditure-items"],
      endpoint: `umrah/expenditure_item?page=1&paginate=10&per_page=10`,
    });

  /* ── Derived ── */
  const defaultWalletId = useMemo(
    () => walletData?.data?.data?.[0]?.id ?? null,
    [walletData],
  );
  const itineraries = useMemo(() => itineraryData?.data ?? [], [itineraryData]);
  const expItems = useMemo(() => itemsData?.data?.data ?? [], [itemsData]);

  /* ── Mutation ── */
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutate({
    endpoint: "itinerary-transactions/spend",
    mutationKey: ["spend"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      router.back();
    },
  });

  /* ── Handlers ── */
  const handleSelectItinerary = useCallback((id: number) => {
    setSelectedItinerary(id);
    setSelectedItem(null);
  }, []);
  const handleSelectItem = useCallback((id: number) => setSelectedItem(id), []);

  const isValid =
    defaultWalletId &&
    selectedItinerary &&
    selectedItem &&
    amount &&
    description;

  const handleSubmit = useCallback(() => {
    if (!isValid) return;
    mutate({
      wallet_id: defaultWalletId,
      itinerary_id: selectedItinerary,
      expenditure_item_id: selectedItem,
      amount: Number(amount),
      description,
    });
  }, [
    isValid,
    defaultWalletId,
    selectedItinerary,
    selectedItem,
    amount,
    description,
    mutate,
  ]);

  /* ── Loading ── */
  if (walletLoading || itineraryLoading || itemsLoading) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="chevron-forward" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>صرف جديد</Text>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-forward" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>صرف جديد</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── اختيار الرحلة ── */}
          <View style={styles.card}>
            <SectionLabel icon="airplane-outline" label="اختيار الرحلة" />
            {itineraries.length === 0 ? (
              <Text style={styles.emptyText}>لا توجد رحلات متاحة</Text>
            ) : (
              <ItinerarySelect
                items={itineraries}
                selected={selectedItinerary}
                onSelect={handleSelectItinerary}
              />
            )}
          </View>

          {/* ── اختر بند الصرف ── */}
          <View style={styles.card}>
            <SectionLabel icon="receipt-outline" label="اختر بند الصرف" />
            {expItems.length === 0 ? (
              <Text style={styles.emptyText}>لا توجد بنود متاحة</Text>
            ) : (
              <ExpenditureSelect
                items={expItems}
                selected={selectedItem}
                onSelect={handleSelectItem}
              />
            )}
          </View>

          {/* ── المبلغ ── */}
          <View style={styles.card}>
            <SectionLabel icon="cash-outline" label="المبلغ" />
            <View style={styles.inputWrap}>
              <Text style={styles.currencyTag}>ر.س</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor="#ccc"
                textAlign="right"
              />
            </View>
          </View>

          {/* ── الوصف ── */}
          <View style={styles.card}>
            <SectionLabel icon="create-outline" label="الوصف" />
            <TextInput
              style={styles.textArea}
              value={description}
              onChangeText={setDescription}
              placeholder="اكتب وصف للصرف..."
              placeholderTextColor="#ccc"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              textAlign="right"
            />
          </View>

          {/* ── Submit ── */}
          <TouchableOpacity
            style={[styles.submitBtn, !isValid && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!isValid || isPending}
            activeOpacity={0.85}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View style={styles.submitInner}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color="#fff"
                  style={{ marginLeft: 8 }}
                />
                <Text style={styles.submitText}>تأكيد الصرف</Text>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PRIMARY },

  header: {
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
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
  },

  scroll: { flex: 1, backgroundColor: "#f5f3f7" },
  scrollContent: { padding: 16, paddingBottom: 40, gap: 12 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 0.5,
    borderColor: BORDER,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  sectionLabel: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionLabelText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    fontWeight: "500",
    color: "#1a1a1a",
    textAlign: "right",
  },

  /* Itinerary — radio style */
  selectGrid: { gap: 8 },
  selectItem: {
    borderWidth: 1,
    borderColor: "rgba(80,13,117,0.15)",
    borderRadius: 12,
    backgroundColor: "#faf8fc",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectItemActive: {
    backgroundColor: ICON_BG,
    borderColor: PRIMARY,
  },
  selectItemInner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  selectRadio: {
    width: 18,
    height: 18,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: "rgba(80,13,117,0.3)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  selectRadioActive: { borderColor: PRIMARY },
  selectRadioDot: {
    width: 9,
    height: 9,
    borderRadius: 99,
    backgroundColor: PRIMARY,
  },
  selectItemText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    color: "#444",
    textAlign: "right",
    flex: 1,
  },
  selectItemTextActive: { color: PRIMARY, fontWeight: "500" },

  /* Expenditure — chip style */
  expGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: 8,
  },
  expItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(80,13,117,0.15)",
    backgroundColor: "#faf8fc",
    position: "relative",
    minWidth: "30%",
    maxWidth: "48%",
  },
  expItemActive: {
    backgroundColor: ICON_BG,
    borderColor: PRIMARY,
  },
  expItemText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: "#555",
    textAlign: "right",
  },
  expItemTextActive: { color: PRIMARY, fontWeight: "500" },
  expItemSub: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 11,
    color: "#aaa",
    textAlign: "right",
    marginTop: 2,
  },
  expItemSubActive: { color: "rgba(80,13,117,0.55)" },
  checkBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 16,
    height: 16,
    borderRadius: 99,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },

  inputWrap: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#faf8fc",
    height: 50,
  },
  currencyTag: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: PRIMARY,
    fontWeight: "500",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 18,
    color: "#1a1a1a",
    height: "100%",
  },
  textArea: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    color: "#1a1a1a",
    minHeight: 100,
    backgroundColor: "#faf8fc",
    textAlign: "right",
  },

  submitBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitInner: { flexDirection: "row-reverse", alignItems: "center" },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: APP_FONT_FAMILY,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f3f7",
  },
  loadingText: {
    marginTop: 12,
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    color: "#888",
  },
  emptyText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: "#bbb",
    textAlign: "center",
    paddingVertical: 8,
  },
});
