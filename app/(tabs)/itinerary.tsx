import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ItineraryScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Itinerary</ThemedText>
      <ThemedText style={styles.text}>Your travel plans go here.</ThemedText>
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
