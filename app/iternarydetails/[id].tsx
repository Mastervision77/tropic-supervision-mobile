import React, { useCallback, useMemo } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import useFetch from '@/hooks/useFetch';
import { Colors } from '@/constants/theme';
import APP_FONT_FAMILY from '@/components/styles/font';
import { ApiResponse, Day } from './components/itinerary/types';
import DayCard from './components/itinerary/DayCard';
import ItineraryHeader from './components/itinerary/ItineraryHeader';

export default function TasksScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    const { data, isLoading, isError } = useFetch<ApiResponse>({
        endpoint: `itinerary/${id}`,
        queryKey: ['itinerary', id],
    });

    const itinerary = useMemo(() => data?.data, [data]);

    const renderDay = useCallback(
        ({ item }: { item: Day }) => <DayCard day={item} theme={theme} />,
        [theme]
    );

    const keyExtractor = useCallback((item: Day) => item.id.toString(), []);

    const ListHeader = useMemo(() => {
        if (!itinerary) return null;
        return <ItineraryHeader itinerary={itinerary} theme={theme} />;
    }, [itinerary, theme]);

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (isError || !itinerary) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.center}>
                    <ThemedText style={styles.errorText}>حدث خطأ أثناء تحميل البيانات</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <ThemedView style={styles.container}>
                <FlatList
                    data={itinerary.days}
                    keyExtractor={keyExtractor}
                    renderItem={renderDay}
                    ListHeaderComponent={ListHeader}
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                />
            </ThemedView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: 'red', fontFamily: APP_FONT_FAMILY, textAlign: 'right' },
    listContainer: { padding: 16, gap: 16 },
});
