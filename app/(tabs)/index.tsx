import APP_FONT_FAMILY from "@/components/styles/font";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/hooks/useAuth";
import useFetch from "@/hooks/useFetch";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = Colors.light.secondary;

const ICON_BG = Colors.light.primary;

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const employeeId = (user as any)?.employee?.id;

  const { data, isLoading } = useFetch({
    queryKey: ["employee-wallets"],
    endpoint: `master-data/employee-wallets?employee_id=${employeeId}`,
    enabled: !!employeeId,
  });

  const wallet = (data as any)?.data?.data?.[0];
  const balance = wallet ? Number(wallet.amount).toLocaleString("en-US") : null;

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerTexts}>
            <Text style={styles.greeting}>مرحباً،</Text>
            <Text style={styles.name}>{user?.name || "ضيف"}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/notifications')}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={PRIMARY} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>
              {(user?.name || 'ض').charAt(0)}
            </Text>
          </View>
        </View>

        {/* ── Wallet card ── */}
        <View style={styles.walletCard}>
          {/* Accent */}
          <View style={styles.cardAccent} />

          <View style={styles.walletBody}>
            {/* Label row */}
            <View style={styles.walletLabelRow}>
              <View style={styles.walletIconWrap}>
                <Ionicons name="wallet-outline" size={16} color={PRIMARY} />
              </View>
              <Text style={styles.walletLabel}>رصيد المحفظة</Text>
            </View>

            {/* Amount */}
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={PRIMARY}
                style={styles.loader}
              />
            ) : balance !== null ? (
              <>
                <Text style={styles.walletAmount}>{balance}</Text>
                <Text style={styles.walletCurrency}>ريال سعودي</Text>

                <View style={styles.walletDivider} />

                {/* Owner row */}
                <View style={styles.ownerRow}>
                  <View style={styles.ownerTexts}>
                    <Text style={styles.ownerLabel}>صاحب المحفظة</Text>
                    <Text style={styles.ownerName}>{wallet.employee_name}</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.noDataWrap}>
                <Ionicons name="wallet-outline" size={36} color="#ddd" />
                <Text style={styles.noDataText}>
                  لا توجد بيانات للمحفظة حالياً
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Quick stats row ── */}
        {wallet && !isLoading && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons
                  name="trending-up-outline"
                  size={18}
                  color={PRIMARY}
                />
              </View>
              <Text style={styles.statLabel}>الشحنات</Text>
              <Text style={styles.statValue}>—</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons name="receipt-outline" size={18} color={PRIMARY} />
              </View>
              <Text style={styles.statLabel}>المصاريف</Text>
              <Text style={styles.statValue}>—</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconWrap}>
                <Ionicons name="airplane-outline" size={18} color={PRIMARY} />
              </View>
              <Text style={styles.statLabel}>الرحلات</Text>
              <Text style={styles.statValue}>—</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#f5f3f7",
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },

  /* Header */
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    alignSelf: "flex-start",
  },
  headerTexts: {
    alignItems: "flex-start",
    flex: 1,
  },
  greeting: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    color: "#aaa",
    textAlign: "right",
  },
  name: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 22,
    fontWeight: "600",
    color: PRIMARY,
    textAlign: "right",
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
    marginStart: 14,
    borderWidth: 0.5,
    borderColor: "rgba(80,13,117,0.15)",
  },
  avatarInitial: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 18,
    fontWeight: "600",
    color: PRIMARY,
  },

  /* Wallet card */
  walletCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(80,13,117,0.1)",
    overflow: "hidden",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,

  },
  cardAccent: {
    height: 4,
    backgroundColor: PRIMARY,
  },
  walletBody: {
    padding: 20,
    alignItems: "flex-start",
  },
  walletLabelRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  walletIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  walletLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    color: "#888",
    textAlign: "right",
  },
  walletAmount: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 42,
    fontWeight: "600",
    color: PRIMARY,
    textAlign: "right",
    lineHeight: 52,
  },
  walletCurrency: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: "#aaa",
    textAlign: "right",
    marginTop: 2,
  },
  walletDivider: {
    height: 0.5,
    backgroundColor: "rgba(80,13,117,0.1)",
    width: "100%",
    marginVertical: 16,
  },
  ownerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  ownerAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerTexts: {
    alignItems: "flex-start",
  },
  ownerLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 11,
    color: "#bbb",
    textAlign: "right",
  },
  ownerName: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    textAlign: "right",
  },

  /* No data */
  noDataWrap: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 10,
    width: "100%",
  },
  noDataText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    color: "#bbb",
    textAlign: "center",
  },

  /* Loader */
  loader: {
    marginVertical: 24,
  },

  /* Stats row */
  statsRow: {
    flexDirection: "row-reverse",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    alignItems: "flex-end",
    borderWidth: 0.5,
    borderColor: "rgba(80,13,117,0.08)",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 11,
    color: "#aaa",
    textAlign: "right",
    marginBottom: 3,
  },
  statValue: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
    fontWeight: "500",
    color: PRIMARY,
    textAlign: "right",
  },
  headerRight: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: ICON_BG,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "rgba(80,13,117,0.15)",
  },
});
