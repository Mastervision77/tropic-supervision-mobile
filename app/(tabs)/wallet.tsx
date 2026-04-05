import { ActivityIndicator, StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/useAuth';
import useFetch from '@/hooks/useFetch';
import APP_FONT_FAMILY from '@/components/styles/font';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type Transaction = {
  id: number;
  type: string;
  amount: number;
  description: string;
  employee: { id: number; name: string };
  wallet: { id: number; balance: number };
  expenditure_item: { id: number; name: string; max_amount: number };
  itinerary: { id: number; name: string };
  created_at: string;
};

type ResponseData = {
  data: Transaction[];
  totals: { charges: number; expenses: number };
  pagination: { current_page: number; last_page: number; per_page: number; total: number };
};

const TransactionItem = ({ item }: { item: Transaction }) => (
  <View style={styles.transactionItem}>
    <View style={styles.transactionDetails}>
      <Text style={styles.transactionDescription}>
        {item.expenditure_item?.name ?? item.description}
      </Text>
      {item.expenditure_item?.name && (
        <Text style={styles.transactionMeta}>{item.description}</Text>
      )}
      <Text style={styles.transactionMeta}>
        {item.itinerary?.name}
        {'  ·  '}
        {new Date(item.created_at).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}
      </Text>
    </View>

    <Text style={styles.transactionAmount}>-{item.amount.toLocaleString('en-US')} ر.س</Text>

    <View style={styles.iconContainer}>
      <Ionicons name="receipt-outline" size={20} color={PRIMARY} />
    </View>
  </View>
);

export default function WalletScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const employeeId = (user as any)?.employee?.id;
  const employeeName = (user as any)?.employee?.name ?? 'المستخدم';

  const { data, isLoading, error } = useFetch<ResponseData>({
    endpoint: `itinerary-transactions?employee_id=${employeeId}&type=expense`,
    queryKey: ['wallet-transactions', employeeId],
    enabled: !!employeeId,
  });

  const charges = data?.totals?.charges ?? 0;
  const expenses = data?.totals?.expenses ?? 0;

  console.log('data',data);

  if (isLoading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <ThemedText style={styles.loadingText}>جاري التحميل...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !data) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText style={styles.errorText}>حدث خطأ في تحميل البيانات</ThemedText>
      </ThemedView>
    );
  }

  return (
    <View style={styles.root}>

      <View style={styles.header}>
        <View style={styles.headerRow}>

          <TouchableOpacity
            style={styles.spendBtn}
            onPress={() => router.push('/spend')}
            activeOpacity={0.85}
          >
            <Ionicons name="arrow-up-circle-outline" size={16} color={PRIMARY} />
            <Text style={styles.spendBtnText}>صرف</Text>
          </TouchableOpacity>

          <View style={styles.headerTexts}>
            <Text style={styles.headerGreeting}>مرحباً، {employeeName}</Text>
            <Text style={styles.headerTitle}>محفظتي</Text>
          </View>

        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.totalsRow}>
          <View style={styles.totalColumn}>
            <Text style={styles.totalLabel}>إجمالي المصاريف</Text>
            <Text style={[styles.totalValue, { color: Colors.light.primary }]}>
              {expenses.toLocaleString('en-US')} ر.س
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalColumn}>
            <Text style={styles.totalLabel}>إجمالي الشحنات</Text>
            <Text style={[styles.totalValue, { color: '#1a1a1a' }]}>
              {charges.toLocaleString('en-US')} ر.س
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.listWrapper}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>آخر المعاملات</Text>
        {data.data.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="receipt-outline" size={36} color="#ddd" />
            <Text style={styles.emptyText}>لا توجد معاملات بعد</Text>
          </View>
        ) : (
          data.data.map((item) => <TransactionItem key={item.id} item={item} />)
        )}
      </ScrollView>

    </View>
  );
}

const PRIMARY = '#500d75';
const ICON_BG = '#f5eefa';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f5f3f7',
  },

  header: {
    backgroundColor: PRIMARY,
    paddingTop: 56,
    paddingBottom: 44,
    paddingHorizontal: 20,
  },
  expenditureBadge: {
  marginTop: 5,
  alignSelf: 'flex-end',
  backgroundColor: ICON_BG,
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 6,
},
expenditureBadgeText: {
  fontSize: 11,
  color: PRIMARY,
  fontFamily: APP_FONT_FAMILY,
  fontWeight: '500',
},
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  headerTexts: {
    alignItems: 'flex-end',
  },
  headerGreeting: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginBottom: 4,
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'right',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'right',
  },
  spendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    alignSelf: 'flex-end',
  },
  spendBtnText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: APP_FONT_FAMILY,
  },

  summaryCard: {
    marginHorizontal: 16,
    marginTop: -28,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(80,13,117,0.12)',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    zIndex: 10,
  },
  totalsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  totalColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'right',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    alignSelf: 'stretch',
    marginHorizontal: 16,
  },

  progressSection: {
    marginTop: 16,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressRemaining: {
    fontSize: 11,
    color: '#888',
    fontFamily: APP_FONT_FAMILY,
  },
  progressPercent: {
    fontSize: 11,
    color: PRIMARY,
    fontWeight: '500',
    fontFamily: APP_FONT_FAMILY,
  },
  progressTrack: {
    backgroundColor: '#f0e8f5',
    borderRadius: 99,
    height: 6,
  },
  progressFill: {
    backgroundColor: PRIMARY,
    height: 6,
    borderRadius: 99,
  },

  listWrapper: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a1a1a',
    textAlign: 'right',
    marginBottom: 12,
    fontFamily: APP_FONT_FAMILY,
  },

transactionItem: {
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 14,
  marginBottom: 10,
  borderWidth: 0.5,
  borderColor: 'rgba(0,0,0,0.06)',
  flexDirection: 'row-reverse',  // 👈 عكسنا الاتجاه
  alignItems: 'center',
},
iconContainer: {
  width: 38,
  height: 38,
  borderRadius: 10,
  backgroundColor: ICON_BG,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,  // 👈 كان marginLeft
  flexShrink: 0,
},
transactionAmount: {
  fontSize: 16,
  fontWeight: '500',
  color: '#c0392b',
  marginLeft: 12,  // 👈 كان marginRight
  fontFamily: APP_FONT_FAMILY,
},
  transactionDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
    textAlign: 'right',
    marginBottom: 3,
    fontFamily: APP_FONT_FAMILY,
  },
  transactionMeta: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
    fontFamily: APP_FONT_FAMILY,
  },

  /* Empty state */
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },

  /* States */
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f3f7',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
    fontFamily: APP_FONT_FAMILY,
  },
  errorText: {
    fontSize: 14,
    color: '#888',
    fontFamily: APP_FONT_FAMILY,
  },
});