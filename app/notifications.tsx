import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import APP_FONT_FAMILY from '@/components/styles/font';
import useFetch from '@/hooks/useFetch';

const PRIMARY = '#500d75';
const ICON_BG = '#f7f4fa';

/* ── Types ── */
interface NotificationData {
  type: string;
  [key: string]: string;
}

interface Sender {
  id: number;
  name: string;
  email: string;
}

interface Notification {
  id: number;
  title: string;
  body: string;
  data: NotificationData;
  sender: Sender;
  created_at: string;
}

interface NotificationsResponse {
  data: Notification[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/* ── Helpers ── */
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

function getTypeIcon(type: string): React.ComponentProps<typeof Ionicons>['name'] {
  switch (type) {
    case 'wallet_charge': return 'wallet-outline';
    case 'emergency_chat': return 'warning-outline';
    case 'new_task_comment': return 'chatbubble-outline';
    default: return 'notifications-outline';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'wallet_charge': return '#27ae60';
    case 'emergency_chat': return '#e74c3c';
    case 'new_task_comment': return PRIMARY;
    default: return '#888';
  }
}

function getTypeBg(type: string): string {
  switch (type) {
    case 'wallet_charge': return '#eafaf1';
    case 'emergency_chat': return '#fdf0ef';
    case 'new_task_comment': return ICON_BG;
    default: return '#f5f5f5';
  }
}

/* ── NotificationItem ── */
const NotificationItem = React.memo(({ item }: { item: Notification }) => {
  const color = getTypeColor(item.data?.type);
  const bg = getTypeBg(item.data?.type);
  const icon = getTypeIcon(item.data?.type);

  return (
    <View style={[styles.card]}>
      <View style={styles.cardRow}>
        {/* Icon */}
        <View style={[styles.iconWrap, { backgroundColor: bg }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.cardBody} numberOfLines={2}>
            {item.body}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
            <View style={[styles.typeBadge, { backgroundColor: bg }]}>
              <Text style={[styles.typeBadgeText, { color }]}>
                {item.sender?.name ?? '—'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
});

/* ── Empty State ── */
const EmptyState = () => (
  <View style={styles.emptyWrap}>
    <Ionicons name="notifications-off-outline" size={56} color="#ddd" />
    <Text style={styles.emptyText}>لا توجد إشعارات</Text>
  </View>
);

/* ── Main Screen ── */
export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, error, refetch } = useFetch<NotificationsResponse>({
    queryKey: ['my-notifications'],
    endpoint: 'my-notifications',
  });

  const notifications = data?.data ?? [];
  const pagination = data?.pagination;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderItem = useCallback(
    ({ item }: { item: Notification }) => <NotificationItem item={item} />,
    []
  );

  const keyExtractor = useCallback((item: Notification) => item.id.toString(), []);

  /* ── Error State ── */
  if (error && !isLoading) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>الإشعارات</Text>
        </View>
        <View style={styles.centered}>
          <Ionicons name="cloud-offline-outline" size={52} color="#ccc" />
          <Text style={styles.errorTitle}>فشل تحميل الإشعارات</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Ionicons name="refresh-outline" size={16} color="#fff" />
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإشعارات</Text>
        {pagination && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{pagination.total}</Text>
          </View>
        )}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY} />
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.listEmpty,
          ]}
          ListEmptyComponent={EmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={PRIMARY}
              colors={[PRIMARY]}
            />
          }
          showsVerticalScrollIndicator={false}
          initialNumToRender={10}
          windowSize={5}
        />
      )}
    </SafeAreaView>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fafafa',
  },

  header: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#f5f3f7',
  },
  headerTitle: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 22,
    fontWeight: '600',
    color: PRIMARY,
    textAlign: 'right',
  },
  countBadge: {
    backgroundColor: PRIMARY,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 10,
  },
  listEmpty: {
    flex: 1,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,

    elevation: 2,

    marginBottom: 10,
    overflow: 'hidden',
  },
  cardRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'right',
    marginBottom: 4,
  },
  cardBody: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12.5,
    color: '#666',
    textAlign: 'right',
    lineHeight: 19,
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  cardDate: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 11,
    color: '#bbb',
    textAlign: 'right',
  },
  typeBadge: {
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 11,
    fontWeight: '500',
  },

  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    color: '#888',
  },
  errorTitle: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    textAlign: 'center',
  },
  retryBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },

  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    color: '#bbb',
    textAlign: 'center',
  },
});