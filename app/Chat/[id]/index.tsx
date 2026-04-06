import React, { useCallback } from 'react';
import {
    StyleSheet,
    FlatList,
    ActivityIndicator,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import useFetch from '@/hooks/useFetch';
import APP_FONT_FAMILY from '@/components/styles/font';

const PRIMARY = '#500d75';
const ICON_BG = '#f0e8f5';

interface Chat {
    id: number;
    name: string;
    last_message: string;
    last_message_at: string;
    last_message_sender: 'you' | 'other';
}

interface ApiResponse {
    data: Chat[];
}

function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

const ChatItem = React.memo(({ item, onPress }: { item: Chat; onPress: (id: number) => void }) => {
    const isYou = item.last_message_sender === 'you';

    return (
        <TouchableOpacity style={styles.chatItem} onPress={() => onPress(item.id)} activeOpacity={0.75}>
            {/* Avatar */}
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                    {item.name.charAt(0).toUpperCase()}
                </Text>
            </View>

            {/* Content */}
            <View style={styles.chatContent}>
                <View style={styles.chatTopRow}>
                    <Text style={styles.chatTime}>{formatTime(item.last_message_at)}</Text>
                    <Text style={styles.chatName}>{item.name}</Text>
                </View>
                <View style={styles.chatBottomRow}>
                    {isYou && (
                        <Ionicons name="checkmark-done-outline" size={14} color="#888" style={styles.sentIcon} />
                    )}
                    <Text style={styles.lastMessage} numberOfLines={1}>
                        {isYou ? `أنت: ${item.last_message}` : item.last_message}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
});

export default function ChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();

    const { data, isLoading, isError } = useFetch<ApiResponse>({
        endpoint: `umrah/get-chats?itinerary_id=${id}`,
        queryKey: ['chats', id],
        enabled: !!id,
    });

    const handleOpenConversation = useCallback(
        (chatId: number) => {
            router.push(`/Chat/${id}/conversation/${chatId}` as any);
        },
        [router, id]
    );

    const renderItem = useCallback(
        ({ item }: { item: Chat }) => (
            <ChatItem item={item} onPress={handleOpenConversation} />
        ),
        [handleOpenConversation]
    );

    return (
        <SafeAreaView style={styles.root} edges={['top']}>
            {/* Header */}
           {/* Header */}
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
                        <ThemedText style={styles.errorText}>حدث خطأ أثناء تحميل المحادثات</ThemedText>
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',  
  },
    headerTexts: {
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
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
    },


    body: {
        flex: 1,
        backgroundColor: '#f5f3f7',
    },
    listContent: {
        padding: 16,
        paddingBottom: 32,
    },


    chatItem: {
        backgroundColor: '#fff',
        borderRadius: 14,
        padding: 14,
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 12,
        borderWidth: 0.5,
        borderColor: 'rgba(80,13,117,0.08)',
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
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(80,13,117,0.15)',
        flexShrink: 0,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: '600',
        color: PRIMARY,
        fontFamily: APP_FONT_FAMILY,
    },

    chatContent: {
        flex: 1,
        gap: 5,
    },
    chatTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#1a1a1a',
        fontFamily: APP_FONT_FAMILY,
        textAlign: 'right',
    },
    chatTime: {
        fontSize: 11,
        color: '#aaa',
        fontFamily: APP_FONT_FAMILY,
    },
    chatBottomRow: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 4,
    },
    lastMessage: {
        flex: 1,
        fontSize: 13,
        color: '#888',
        fontFamily: APP_FONT_FAMILY,
        textAlign: 'right',
    },
    sentIcon: {
        flexShrink: 0,
    },

    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#bbb',
        fontFamily: APP_FONT_FAMILY,
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontFamily: APP_FONT_FAMILY,
        textAlign: 'right',
        fontSize: 14,
    },
});