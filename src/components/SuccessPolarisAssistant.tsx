// SuccessPolarisAssistant - Version React Native (WebView)

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import WebView from 'react-native-webview';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface SuccessPolarisAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessPolarisAssistant: React.FC<SuccessPolarisAssistantProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" transparent={false} onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#0891b2" />
      <View style={styles.container}>
        <LinearGradient
          colors={['#0891b2', '#1d4ed8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <View style={styles.iconWrapper}>
              <Text style={styles.iconText}>🤖</Text>
            </View>
            <View>
              <Text style={styles.title}>Assistant Léon Astarte</Text>
              <Text style={styles.subtitle}>IA // StackAI Protocol</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.webviewContainer}>
          <WebView
            source={{ uri: 'https://www.stackai.com/chat/69bf07f4d6eabd15e91e0d64-0S0UCJiReYt23u3qA38Q79' }}
            style={styles.webview}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Canal de communication sécurisé // Léon Astarte Protocol
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
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
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
  },
  title: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 9,
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
    color: '#ffffff',
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
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.20)',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    textAlign: 'center',
  },
});

export default SuccessPolarisAssistant;
