import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import APP_FONT_FAMILY from '@/components/styles/font';
import { Comment } from './types';

interface Props {
  comment: Comment;
}

const CommentItem = React.memo(({ comment }: Props) => {
  const text =
    typeof comment?.comment === 'string'
      ? comment.comment
      : JSON.stringify(comment?.comment ?? '');

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.body, { color: '#000' }]}>
        {text}
      </ThemedText>
    </View>
  );
});

export default CommentItem;

const styles = StyleSheet.create({
  container: {
    paddingLeft: 10,
    marginBottom: 6,
    paddingVertical: 4,
  },
  body: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    textAlign: 'right',
  },
});