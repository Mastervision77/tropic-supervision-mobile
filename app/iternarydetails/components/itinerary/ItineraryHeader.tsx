import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import APP_FONT_FAMILY from '@/components/styles/font';
import { ItineraryDetail } from './types';

interface Props {
  itinerary: ItineraryDetail;
  theme: any;
}

const ItineraryHeader = React.memo(({ itinerary, theme }: Props) => (
  <View style={[styles.container, { backgroundColor: theme.primary + '15' }]}>
    <ThemedText style={[styles.name, { color: theme.primary }]}>
      {itinerary.name}
    </ThemedText>

    {itinerary.description ? (
      <ThemedText style={styles.description}>{itinerary.description}</ThemedText>
    ) : null}

    <View style={styles.tripInfo}>
      <ThemedText style={[styles.program, { color: theme.secondary }]}>
        {itinerary.program_trip.program}
      </ThemedText>
      <ThemedText style={[styles.dates, { color: theme.secondary }]}>
        {itinerary.program_trip.travel_date} ← {itinerary.program_trip.return_date}
      </ThemedText>
    </View>
  </View>
));

export default ItineraryHeader;

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  name: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 20,
    textAlign: 'right',
    marginBottom: 6,
  },
  description: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    textAlign: 'right',
    color: '#555',
    marginBottom: 10,
  },
  tripInfo: { gap: 4 },
  program: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    textAlign: 'right',
  },
  dates: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    textAlign: 'right',
  },
});