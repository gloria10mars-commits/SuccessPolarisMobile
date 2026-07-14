// ChatWidget - Version React Native (WebView)
// Charge l'assistant externe dans une WebView plein écran.

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
} from 'react-native';
import WebView from 'react-native-webview';
import { Document } from '../types';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface ChatWidgetProps {
  documents: Document[];
  onOpen?: () => boolean | void;
  isOpen?: boolean;
  onClose?: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ onOpen, isOpen, onClose }) => {
  const handleOpen = () => {
    if (onOpen) {
      onOpen();
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handleOpen}
        style={styles.fab}
        activeOpacity={0.7}
      >
        <Text style={styles.fabIcon}>💬</Text>
      </TouchableOpacity>

      <Modal visible={!!isOpen} animationType="slide" transparent={false} onRequestClose={onClose}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.primary} />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrapper}>
                <Text style={styles.iconText}>🎓</Text>
              </View>
              <View>
                <Text style={styles.title}>Assistant Léon Astarte</Text>
                <Text style={styles.subtitle}>Intelligence Protocol</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.webviewContainer}>
            <WebView
              source={{ uri: 'https://astarte18.pages.dev/' }}
              style={styles.webview}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 4000,
  },
  fabIcon: {
    fontSize: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: 1,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  title: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: 'rgba(0, 0, 0, 0.60)',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#020617',
  },
  webview: {
    flex: 1,
  },
});

export default ChatWidget;
