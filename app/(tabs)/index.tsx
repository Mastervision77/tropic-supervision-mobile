import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, View, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import APP_FONT_FAMILY from '@/components/styles/font';
import useFetch from '@/hooks/useFetch';

export default function HomeScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];

  const employeeId = (user as any)?.employee?.id;

  const { data, isLoading, error, refetch } = useFetch({
    queryKey: ['employee-wallets'],
    endpoint: `master-data/employee-wallets?employee_id=${employeeId}`,
    enabled: !!employeeId,
  });

  const wallet = (data as any)?.data?.data?.[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting]}>
          مرحباً بك
        </Text>
        <Text style={[styles.name, { color: colors.primary }]}>
          {user?.name || 'ضيف'}
        </Text>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator size="large" color={colors.secondary} style={styles.loader} />
        ) : wallet ? (
          <View style={[styles.walletCard, { backgroundColor: colors.primary }]}>
            <View style={styles.walletCardInner}>
              <Text style={styles.walletTitle}>رصيد المحفظة</Text>
              
              <View style={styles.amountContainer}>
                <Text style={styles.walletAmount}>
                  {Number(wallet.amount).toLocaleString('en-US')}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.walletFooter}>
                <Text style={[styles.walletOwner, { color: colors.secondary }]}>{wallet.employee_name}</Text>
                 <Text style={styles.walletOwnerLabel}>صاحب المحفظة</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.noDataCard, { backgroundColor: colors.background, borderColor: colors.primary }]}>
            <Text style={[styles.noDataText, { color: colors.text }]}>
              لا توجد بيانات للمحفظة حالياً
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'flex-start',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingTop: 20,
  },
  loader: {
    marginTop: 40,
  },
  greeting: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 20,
    marginBottom: 5,
    opacity: 0.8,
    textAlign:'center',
    width:'100%'
  },
  name: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 28,
    textAlign:'center',
    width:'100%'
  },
  walletCard: {
    width: '100%',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  walletCardInner: {
    padding: 24,
    alignItems: 'flex-end',
    width: '100%',
  },
  walletTitle: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
    color: '#FFE8DF',
    marginBottom: 15,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  walletAmount: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 42,
    color: '#FFF',
    includeFontPadding: false,
  },
  currency: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 18,
    color: '#FFF',
    marginLeft: 8,
    opacity: 0.9,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFFFFF',
    opacity: 0.2,
    width: '100%',
    marginVertical: 20,
  },
  walletFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  walletOwnerLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: '#FFE8DF',
  },
  walletOwner: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 15,
  },
  noDataCard: {
    width: '100%',
    padding: 30,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  noDataText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
  },
});
