import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import APP_FONT_FAMILY from '@/components/styles/font';
import TaskItem from './TaskItem';
import { Day } from './types';
import AttachmentItem from '../attachments/AttachmentItem';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

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
    <View style={[styles.card, { backgroundColor: theme.background }]}>

      {/* Header — always visible, tap to toggle */}
      <TouchableOpacity
        style={[styles.header, { backgroundColor: theme.primary }]}
        onPress={toggle}
        activeOpacity={0.85}
      >
        <ThemedText style={styles.dayNumber}>اليوم {day.day_number}</ThemedText>
        <View style={styles.headerRight}>
          <ThemedText style={styles.dayDate}>{day.day_date}</ThemedText>
          <ThemedText style={styles.arrow}>{expanded ? '▲' : '▼'}</ThemedText>
        </View>
      </TouchableOpacity>

      {/* Collapsible content */}
      {expanded && (
        <View style={styles.content}>
          <ThemedText style={[styles.title, { color: theme.primary }]}>
            {day.title}
          </ThemedText>

          {day.description ? (
            <ThemedText style={styles.description}>{day.description}</ThemedText>
          ) : null}

          {/* Attachments */}
          {day.attachments.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: theme.primary }]}>
                المرفقات:
              </ThemedText>
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

          {/* Tasks */}
          {day.tasks.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionLabel, { color: theme.primary }]}>
                المهام:
              </ThemedText>
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
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  dayNumber: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  dayDate: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: '#ffffffcc',
  },
  arrow: {
    fontSize: 10,
    color: '#ffffffcc',
  },
  content: { padding: 16 },
  title: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 6,
  },
  description: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    textAlign: 'right',
    color: '#555',
    marginBottom: 8,
  },
  section: { marginTop: 12 },
  sectionLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: 8,
  },
  attachmentsScroll: { marginTop: 4 },
});