// components/attachments/AttachmentItem.tsx
import React, { useCallback, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  Linking,
  Alert,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import APP_FONT_FAMILY from '@/components/styles/font';


interface Attachment {
  id: number;
  name: string;
  url: string;
}


const isPDF = (url: string): boolean =>
  url.toLowerCase().endsWith('.pdf');

const isImage = (url: string): boolean =>
  /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(url);


interface ImageModalProps {
  visible: boolean;
  uri: string;
  name: string;
  onClose: () => void;
}

const ImageModal = React.memo(({ visible, uri, name, onClose }: ImageModalProps) => (
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
    statusBarTranslucent
  >
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <View style={styles.modalContent}>
        <Image
          source={{ uri }}
          style={styles.modalImage}
          resizeMode="contain"
        />
        <ThemedText style={styles.modalImageName} numberOfLines={1}>
          {name}
        </ThemedText>
      </View>
    </Pressable>
  </Modal>
));


interface PDFThumbnailProps {
  name: string;
  theme: any;
  onPress: () => void;
}

const PDFThumbnail = React.memo(({ name, theme, onPress }: PDFThumbnailProps) => (
  <TouchableOpacity
    style={[styles.pdfContainer, { borderColor: theme.primary + '50', backgroundColor: theme.primary + '10' }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <ThemedText style={[styles.pdfIcon]}>📄</ThemedText>
    <ThemedText style={[styles.attachmentName, { color: theme.primary }]} numberOfLines={2}>
      {name}
    </ThemedText>
    <ThemedText style={[styles.pdfOpenText, { color: theme.secondary }]}>
      افتح PDF
    </ThemedText>
  </TouchableOpacity>
));

// ─── Image Thumbnail ──────────────────────────────────────────────────────────

interface ImageThumbnailProps {
  attachment: Attachment;
  theme: any;
  onPress: () => void;
}

const ImageThumbnail = React.memo(({ attachment, theme, onPress }: ImageThumbnailProps) => (
  <TouchableOpacity
    style={styles.attachmentItem}
    onPress={onPress}
    activeOpacity={0.8}
  >
    <Image
      source={{ uri: attachment.url }}
      style={styles.attachmentImage}
      resizeMode="cover"
    />
    <ThemedText
      style={[styles.attachmentName, { color: theme.primary }]}
      numberOfLines={1}
    >
      {attachment.name}
    </ThemedText>
  </TouchableOpacity>
));

// ─── Main AttachmentItem ──────────────────────────────────────────────────────

interface AttachmentItemProps {
  attachment: Attachment;
  theme: any;
}

const AttachmentItem = React.memo(({ attachment, theme }: AttachmentItemProps) => {
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = useCallback(() => setModalVisible(true), []);
  const closeModal = useCallback(() => setModalVisible(false), []);

  const openPDF = useCallback(async () => {
    try {
      const supported = await Linking.canOpenURL(attachment.url);
      if (supported) {
        await Linking.openURL(attachment.url);
      } else {
        Alert.alert('خطأ', 'لا يمكن فتح هذا الملف');
      }
    } catch {
      Alert.alert('خطأ', 'حدث خطأ أثناء فتح الملف');
    }
  }, [attachment.url]);

  if (isPDF(attachment.url)) {
    return <PDFThumbnail name={attachment.name} theme={theme} onPress={openPDF} />;
  }

  if (isImage(attachment.url)) {
    return (
      <>
        <ImageThumbnail attachment={attachment} theme={theme} onPress={openModal} />
        <ImageModal
          visible={modalVisible}
          uri={attachment.url}
          name={attachment.name}
          onClose={closeModal}
        />
      </>
    );
  }

  // Fallback: Unknown file type
  return (
    <TouchableOpacity
      style={[styles.pdfContainer, { borderColor: theme.primary + '50' }]}
      onPress={() => Linking.openURL(attachment.url)}
      activeOpacity={0.7}
    >
      <ThemedText style={styles.pdfIcon}>📎</ThemedText>
      <ThemedText style={[styles.attachmentName, { color: theme.primary }]} numberOfLines={2}>
        {attachment.name}
      </ThemedText>
    </TouchableOpacity>
  );
});

export default AttachmentItem;


const styles = StyleSheet.create({
  // Image thumbnail
  attachmentItem: {
    marginLeft: 10,
    alignItems: 'center',
    width: 90,
  },
  attachmentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  attachmentName: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 80,
  },

  // PDF thumbnail
  pdfContainer: {
    marginLeft: 10,
    width: 90,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    gap: 4,
  },
  pdfIcon: {
    fontSize: 28,
  },
  pdfOpenText: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: '#000000cc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    alignItems: 'center',
    gap: 12,
  },
  modalImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
  },
  modalImageName: {
    fontFamily: APP_FONT_FAMILY,
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
});