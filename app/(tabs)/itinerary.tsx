import React, { useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import useFetch from '@/hooks/useFetch';
import APP_FONT_FAMILY from '@/components/styles/font';

const PRIMARY = '#500d75';
const ICON_BG = '#f0e8f5';

interface Employee {
  id: number;
  name: string;
}

interface Itinerary {
  id: number;
  name: string;
  description: string | null;
  employees: Employee[];
  total_expenses: string | number;
}

interface ApiResponse {
  data: Itinerary[];
}

const ItineraryCard = React.memo(({
  item,
  onShowTasks,
  onOpenChat,
}: {
  item: Itinerary;
  onShowTasks: (id: number) => void;
  onOpenChat: (id: number) => void;
}) => (
  <View style={styles.card}>
    <View style={styles.cardAccent} />

    <View style={styles.cardBody}>
      <View style={styles.cardHeader}>
        <View style={styles.expenseBadge}>
          <Text style={styles.expenseText}>
            {Number(item.total_expenses).toLocaleString('en-US')} SAR
          </Text>
        </View>
        <Text style={styles.cardTitle}>{item.name}</Text>
      </View>

      {item.description ? (
        <Text style={styles.cardDescription}>{item.description}</Text>
      ) : null}

      {item.employees?.length > 0 && (
        <>
          <Text style={styles.employeesLabel}>الموظفون</Text>
          <View style={styles.employeesRow}>
            {item.employees.map((emp) => (
              <View key={emp.id} style={styles.employeePill}>
                <Text style={styles.employeePillText}>{emp.name}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => onOpenChat(item.id)}
          activeOpacity={0.8}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={PRIMARY} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tasksButton}
          onPress={() => onShowTasks(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.tasksButtonText}>عرض المهام</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
));

export default function ItineraryScreen() {
  const { user } = useAuth();
  const employeeId = (user as any)?.employee?.id;
  const router = useRouter();

  const { data, isLoading, isError } = useFetch<ApiResponse>({
    endpoint: `itinerary?employee_id=${employeeId}`,
    queryKey: ['itineraries', 'employee', employeeId],
  });

  const handleShowTasks = useCallback(
    (id: number) => {
      router.push(`/iternarydetails/${id}` as any);
    },
    [router]
  );

  const handleOpenChat = useCallback(
    (id: number) => {
      router.push(`/Chat/${id}` as any);
    },
    [router]
  );

  const renderItem = useCallback(
    ({ item }: { item: Itinerary }) => (
      <ItineraryCard
        item={item}
        onShowTasks={handleShowTasks}
        onOpenChat={handleOpenChat}
      />
    ),
    [handleShowTasks, handleOpenChat]
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerSub}>قائمة</Text>
        <Text style={styles.headerTitle}>رحلاتي</Text>
      </View>

      <ThemedView style={styles.body}>
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={PRIMARY} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <ThemedText style={styles.errorText}>حدث خطأ أثناء تحميل البيانات</ThemedText>
          </View>
        ) : (
          <FlatList
            data={data?.data || []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ThemedView>
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
    alignItems: 'flex-end',
  },
  headerSub: {
    color: 'rgba(255,255,255,0.6)',
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

  body: {
    flex: 1,
    backgroundColor: '#f5f3f7',
  },

  listContent: {
    padding: 16,
    paddingBottom: 32,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(80,13,117,0.1)',
    overflow: 'hidden',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardAccent: {
    height: 4,
    backgroundColor: PRIMARY,
  },
  cardBody: {
    padding: 16,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  expenseBadge: {
    backgroundColor: ICON_BG,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexShrink: 0,
  },
  expenseText: {
    fontSize: 13,
    fontWeight: '500',
    color: PRIMARY,
    fontFamily: APP_FONT_FAMILY,
  },

  cardDescription: {
    fontSize: 13,
    color: '#888',
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'right',
    marginBottom: 12,
    lineHeight: 20,
  },

  employeesLabel: {
    fontSize: 12,
    color: '#aaa',
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'right',
    marginBottom: 6,
  },
  employeesRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  employeePill: {
    backgroundColor: ICON_BG,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  employeePillText: {
    fontSize: 12,
    color: PRIMARY,
    fontFamily: APP_FONT_FAMILY,
  },

  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tasksButton: {
    flex: 1,
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: APP_FONT_FAMILY,
  },
  chatButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: ICON_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(80,13,117,0.15)',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    fontFamily: APP_FONT_FAMILY,
    textAlign: 'right',
    fontSize: 14,
  },
});