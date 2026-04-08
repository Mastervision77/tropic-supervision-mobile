// import React from 'react';
// import { View, StyleSheet } from 'react-native';
// import { ThemedText } from '@/components/themed-text';
// import APP_FONT_FAMILY from '@/components/styles/font';
// import { ItineraryDetail } from './types';

// interface Props {
//   itinerary: ItineraryDetail;
//   theme: any;
// }

// const ItineraryHeader = React.memo(({ itinerary, theme }: Props) => (
//   <View style={[styles.container, { backgroundColor: theme.primary + '15' }]}>
//     <ThemedText style={[styles.name, { color: theme.primary }]}>
//       {itinerary.name}
//     </ThemedText>

//     {itinerary.description ? (
//       <ThemedText style={styles.description}>{itinerary.description}</ThemedText>
//     ) : null}

//     <View style={styles.tripInfo}>
//       <ThemedText style={[styles.program, { color: theme.secondary }]}>
//         {itinerary.program_trip.program}
//       </ThemedText>
//       <ThemedText style={[styles.dates, { color: theme.secondary }]}>
//         {itinerary.program_trip.travel_date} ← {itinerary.program_trip.return_date}
//       </ThemedText>
//     </View>
//   </View>
// ));

// export default ItineraryHeader;

// const styles = StyleSheet.create({
//   container: {
//     borderRadius: 12,
//     padding: 16,
//     marginBottom: 8,
//   },
//   name: {
//     fontFamily: APP_FONT_FAMILY,
//     fontSize: 20,
//     textAlign: 'right',
//     marginBottom: 6,
//   },
//   description: {
//     fontFamily: APP_FONT_FAMILY,
//     fontSize: 14,
//     textAlign: 'right',
//     color: '#555',
//     marginBottom: 10,
//   },
//   tripInfo: { gap: 4 },
//   program: {
//     fontFamily: APP_FONT_FAMILY,
//     fontSize: 14,
//     textAlign: 'right',
//   },
//   dates: {
//     fontFamily: APP_FONT_FAMILY,
//     fontSize: 13,
//     textAlign: 'right',
//   },
// });

import APP_FONT_FAMILY from "@/components/styles/font";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ItineraryDetail } from "./types";

const PRIMARY = Colors.light.secondary;

const ICON_BG = Colors.light.primary;

interface Props {
  itinerary: ItineraryDetail;
  theme: any;
}

const ItineraryHeader = React.memo(({ itinerary }: Props) => (
  <View style={styles.card}>
    {/* Accent */}
    <View style={styles.cardAccent} />

    <View style={styles.body}>
      {/* Title */}
      <Text style={styles.name}>{itinerary.name}</Text>

      {/* Description */}
      {itinerary.description ? (
        <Text style={styles.description}>{itinerary.description}</Text>
      ) : null}

      {/* Divider */}
      <View style={styles.divider} />

      {/* Trip info rows */}
      <View style={styles.infoRow}>
        <View style={styles.infoIconWrap}>
          <Ionicons name="briefcase-outline" size={14} color={PRIMARY} />
        </View>
        <Text style={styles.infoText}>{itinerary.program_trip.program}</Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoIconWrap}>
          <Ionicons name="calendar-outline" size={14} color={PRIMARY} />
        </View>
        <Text style={styles.infoText}>
          {itinerary.program_trip.travel_date}
          {"  ←  "}
          {itinerary.program_trip.return_date}
        </Text>
      </View>
    </View>
  </View>
));

export default ItineraryHeader;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 0.5,
    borderColor: "rgba(80,13,117,0.1)",
    overflow: "hidden",
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
  body: {
    padding: 16,
  },
  name: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 19,
    fontWeight: "600",
    color: PRIMARY,
    textAlign: "right",
    marginBottom: 6,
  },
  description: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: "#888",
    textAlign: "right",
    lineHeight: 20,
    marginBottom: 4,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(80,13,117,0.1)",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  infoIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#f0e8f5",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: "#555",
    textAlign: "right",
    flex: 1,
  },
});
