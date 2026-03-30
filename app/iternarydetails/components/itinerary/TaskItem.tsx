import React, { useCallback, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import APP_FONT_FAMILY from '@/components/styles/font';
import CommentItem from './CommentItem';
import { Task } from './types';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface Props {
  task: Task;
  theme: any;
}

const TaskItem = React.memo(({ task, theme }: Props) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View style={[styles.container, {
      backgroundColor: theme.primary + '10',
      borderColor: theme.primary + '30',
    }]}>

      {/* Task header — tap to toggle */}
      <TouchableOpacity
        style={styles.header}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <ThemedText style={[styles.name, { color: theme.primary }]}>
          {task.name}
        </ThemedText>
        <ThemedText style={[styles.arrow, { color: theme.primary }]}>
          {expanded ? '▲' : '▼'}
        </ThemedText>
      </TouchableOpacity>

      {/* Collapsible content */}
      {expanded && (
        <View style={styles.body}>
          {task.description ? (
            <ThemedText style={styles.description}>{task.description}</ThemedText>
          ) : null}

          {task.comments.length > 0 && (
            <CommentsSection comments={task.comments} theme={theme} />
          )}
        </View>
      )}
    </View>
  );
});

// ─── Comments Section (collapsed by default) ─────────────────────────────────

const CommentsSection = React.memo(({ comments, theme }: { comments: Task['comments']; theme: any }) => {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  }, []);

  return (
    <View style={styles.commentsSection}>
      <TouchableOpacity style={styles.commentsHeader} onPress={toggle} activeOpacity={0.7}>
        <ThemedText style={[styles.commentsLabel, { color: theme.primary }]}>
          التعليقات ({comments.length})
        </ThemedText>
        <ThemedText style={[styles.arrow, { color: theme.primary }]}>
          {expanded ? '▲' : '▼'}
        </ThemedText>
      </TouchableOpacity>

      {expanded && comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} theme={theme} />
      ))}
    </View>
  );
});

export default TaskItem;

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  arrow: {
    fontSize: 10,
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  name: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  description: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    textAlign: 'right',
    color: '#555',
    marginBottom: 8,
  },
  commentsSection: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#00000015',
    paddingTop: 8,
  },
  commentsHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  commentsLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
});