import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function WalletScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Wallet (مصاريفي)</ThemedText>
      <ThemedText style={styles.text}>Manage your expenses and wallet here.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  text: {
    marginTop: 16,
    textAlign: 'center',
  },
});
