

import APP_FONT_FAMILY from "@/components/styles/font";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import AttachmentItem from "../attachments/AttachmentItem";
import TaskItem from "./TaskItem";
import { Day } from "./types";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const PRIMARY = Colors.light.secondary;

const ICON_BG = Colors.light.primary;

interface Props {
  day: Day;
  theme: any;
}

const DayCard = React.memo(({ day, theme }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View style={styles.card}>
     
      <View style={styles.cardAccent} />

     
      <TouchableOpacity
        style={styles.header}
        onPress={toggle}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="rgba(255,255,255,0.75)"
          />
        </View>
        <View style={styles.headerleft}>
          <Text style={styles.dayNumber}>اليوم {day.day_number}</Text>
          <Text style={styles.dayDate}>{day.day_date}</Text>
        </View>
      </TouchableOpacity>

      
      {expanded && (
        <View style={styles.content}>
          
          <Text style={styles.title}>{day.title}</Text>

          
          {day.description ? (
            <Text style={styles.description}>{day.description}</Text>
          ) : null}

         
          {day.attachments.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="attach-outline" size={15} color={PRIMARY} />
                <Text style={styles.sectionLabel}>المرفقات</Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.attachmentsScroll}
              >
                {day.attachments.map((att) => (
                  <AttachmentItem key={att.id} attachment={att} theme={theme} />
                ))}
              </ScrollView>
            </View>
          )}

          
          {day.tasks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionLabelRow}>
                <Ionicons name="checkbox-outline" size={15} color={PRIMARY} />
                <Text style={styles.sectionLabel}>المهام</Text>
                <View style={styles.taskCountBadge}>
                  <Text style={styles.taskCountText}>{day.tasks.length}</Text>
                </View>
              </View>
              {day.tasks.map((task) => (
                <TaskItem key={task.id} task={task} theme={theme} />
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
});

export default DayCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
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
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: PRIMARY,
  },
  headerleft: {
    alignItems: "flex-end",
    gap: 2,
  },
  headerLeft: {
    padding: 2,
  },
  dayNumber: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
    textAlign: "left",
  },
  dayDate: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    textAlign: "left",
  },
  content: {
    padding: 16,
  },
  title: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
    fontWeight: "500",
    color: PRIMARY,
    textAlign: "left",
    marginBottom: 6,
  },
  description: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    textAlign: "left",
    color: "#888",
    lineHeight: 21,
    marginBottom: 4,
  },
  section: {
    marginTop: 14,
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  sectionLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    fontWeight: "500",
    color: PRIMARY,
    textAlign: "left",
  },
  taskCountBadge: {
    backgroundColor: "#f0e8f5",
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 1,
    // marginleft: 4,
  },
  taskCountText: {
    fontSize: 11,
    fontWeight: "500",
    color: PRIMARY,
    fontFamily: APP_FONT_FAMILY,
  },
  attachmentsScroll: {
    marginTop: 4,
  },
});
