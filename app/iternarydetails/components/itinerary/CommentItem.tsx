

import APP_FONT_FAMILY from "@/components/styles/font";
import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Comment } from "./types";

const PRIMARY = Colors.light.secondary;

interface Props {
  comment: Comment;
}

const CommentItem = React.memo(({ comment }: Props) => {
  const text =
    typeof comment?.comment === "string"
      ? comment.comment
      : JSON.stringify(comment?.comment ?? "");

  return (
    <View style={styles.container}>
      {/* Avatar dot */}
      <View style={styles.avatarDot}>
        <Ionicons name="person" size={11} color={PRIMARY} />
      </View>

      {/* Bubble */}
      <View style={styles.bubble}>
        <Text style={styles.body}>{text}</Text>
      </View>
    </View>
  );
});

export default CommentItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 8,
  },
  avatarDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f0e8f5",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  bubble: {
    flex: 1,
    backgroundColor: "#faf7fc",
    borderRadius: 12,
    // borderTopleftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: "rgba(80,13,117,0.08)",
  },
  body: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 13,
    color: "#333",
    textAlign: "left",
    lineHeight: 19,
  },
});
