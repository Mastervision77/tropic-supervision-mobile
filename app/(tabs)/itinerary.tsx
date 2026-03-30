import React, { useCallback } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';
import useFetch from '@/hooks/useFetch';
import { Colors } from '@/constants/theme';
import APP_FONT_FAMILY from '@/components/styles/font';

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
  theme, 
  onShowTasks 
}: { 
  item: Itinerary; 
  theme: any; 
  onShowTasks: (id: number) => void 
}) => {
  return (
    <View style={[styles.card, { backgroundColor: theme.background }]}>
      <ThemedText style={[styles.title, { color: theme.primary }]}>{item.name}</ThemedText>
      
      {item.description ? (
        <ThemedText style={[styles.description]}>{item.description}</ThemedText>
      ) : null}
      
      <View style={styles.detailRow}>
        <ThemedText style={[styles.label, { color: theme.primary }]}>الموظفين:</ThemedText>
        <View style={styles.employeesContainer}>
          {item.employees?.map((emp) => (
            <View key={emp.id} style={[styles.employeeBadge, { backgroundColor: theme.primary + '20' }]}>
              <ThemedText style={[styles.employeeName, { color: theme.primary }]}>{emp.name}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.detailRow}>
        <ThemedText style={[styles.label, { color: theme.primary }]}>إجمالي المصروفات:</ThemedText>
        <ThemedText style={[styles.expensesValue, { color: theme.secondary }]}>{item.total_expenses}</ThemedText>
      </View>

      <TouchableOpacity 
        style={[styles.tasksButton, { backgroundColor: theme.primary }]}
        onPress={() => onShowTasks(item.id)}
        activeOpacity={0.8}
      >
        <ThemedText style={styles.tasksButtonText}>عرض المهام</ThemedText>
      </TouchableOpacity>
    </View>
  );
});

export default function ItineraryScreen() {
  const { user } = useAuth();
  const employeeId = (user as any)?.employee?.id;

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  
  const { data, isLoading, isError } = useFetch<ApiResponse>({
    endpoint: `itinerary?employee_id=${employeeId}`,
    queryKey: ['itineraries', 'employee', employeeId],
  });

  const handleShowTasks = useCallback((id: number) => {
    router.push(`/iternarydetails/${id}` as any);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: Itinerary }) => (
    <ItineraryCard item={item} theme={theme} onShowTasks={handleShowTasks} />
  ), [theme, handleShowTasks]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedView style={styles.container}>
        
        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : isError ? (
          <View style={styles.center}>
            <ThemedText style={{ color: 'red', fontFamily: APP_FONT_FAMILY, textAlign: 'right' }}>حدث خطأ أثناء تحميل البيانات</ThemedText>
          </View>
        ) : (
          <FlatList
            data={data?.data || []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: APP_FONT_FAMILY,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    textAlign: 'right',
  },
  listContainer: {
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'right',
  },
  description: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'right',
    color: 'black',
  },
  detailRow: {
    flexDirection: 'row-reverse',
    marginTop: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  label: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    marginLeft: 8,
    textAlign: 'right',
  },
  employeesContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    flex: 1,
  },
  employeeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  employeeName: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    textAlign: 'right',
  },
  expensesValue: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
    textAlign: 'right',
  },
  tasksButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tasksButtonText: {
    fontFamily: APP_FONT_FAMILY,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});
