import APP_FONT_FAMILY from "@/components/styles/font";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ItineraryDetail } from "./types";

const PRIMARY = Colors.light.secondary;

// const ICON_BG = Colors.light.primary;

interface Props {
  itinerary: ItineraryDetail;
  theme: any;
}

const ItineraryHeader = React.memo(({ itinerary }: Props) => (
  <View style={styles.card}>
    <View style={styles.cardAccent} />

    <View style={styles.body}>
      <Text style={styles.name}>{itinerary.name}</Text>

      {itinerary.description ? (
        <Text style={styles.description}>{itinerary.description}</Text>
      ) : null}

     
      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.infoText}>{itinerary.program_trip.program}</Text>
        <View style={styles.infoIconWrap}>
          <Ionicons name="briefcase-outline" size={14} color={PRIMARY} />
        </View>

      </View>

      <View style={styles.infoRow}>

        <Text style={styles.infoText}>
          {itinerary.program_trip.travel_date}
          {"  ←  "}
          {itinerary.program_trip.return_date}
        </Text>
        <View style={styles.infoIconWrap}>
          <Ionicons name="calendar-outline" size={14} color={PRIMARY} />
        </View>
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
    textAlign: "left",
    marginBottom: 6,
    // alignItems: "flex-end",

  },
  description: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: "#888",
    textAlign: "left",
    lineHeight: 20,
    marginBottom: 4,
  },
  divider: {
    height: 0.5,
    backgroundColor: "rgba(80,13,117,0.1)",
    marginVertical: 12,
  },
  infoRow: {
    flexDirection: "row",
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
    textAlign: "left",
    flex: 1,

  },
});
