// PDFViewer - Version React Native (WebView)

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Linking,
  StatusBar,
} from 'react-native';
import WebView from 'react-native-webview';
import { Document } from '../types';
import { storageService } from '../services/storageService';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface PDFViewerProps {
  doc: Document | null;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ doc, onClose }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
  }, [doc]);

  if (!doc) return null;

  const previewUrl = storageService.getDrivePreviewUrl(doc.fileUrl);

  return (
    <Modal visible={!!doc} animationType="slide" transparent={false} onRequestClose={onClose}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.trafficLights}>
              <View style={[styles.light, { backgroundColor: 'rgba(239, 68, 68, 0.5)' }]} />
              <View style={[styles.light, { backgroundColor: 'rgba(234, 179, 8, 0.5)' }]} />
              <View style={[styles.light, { backgroundColor: 'rgba(0, 212, 255, 0.5)' }]} />
            </View>
            <View style={styles.headerTitle}>
              <Text style={styles.headerLabel}>Nexus_Archive_v2.0</Text>
              <Text style={styles.headerDocTitle} numberOfLines={1}>{doc.title}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {!isLoaded && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loaderText}>Décodage du Flux Astral...</Text>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>
          )}
          <WebView
            source={{ uri: previewUrl }}
            style={[styles.webview, { opacity: isLoaded ? 1 : 0 }]}
            onLoad={() => setIsLoaded(true)}
            originWhitelist={['*']}
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Canal Sécurisé Léon Astarte</Text>
          </View>
          <TouchableOpacity
            style={styles.openSourceBtn}
            onPress={() => Linking.openURL(doc.fileUrl)}
            activeOpacity={0.7}
          >
            <Text style={styles.openSourceText}>Ouvrir Source ↗</Text>
          </TouchableOpacity>
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
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  trafficLights: {
    flexDirection: 'row',
    gap: 6,
  },
  light: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerTitle: {
    flexDirection: 'column',
    flex: 1,
  },
  headerLabel: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  headerDocTitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#ffffff',
    fontSize: 18,
  },
  content: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
    zIndex: 10,
    gap: SPACING.md,
  },
  loaderText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 4,
  },
  progressTrack: {
    width: 180,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    width: '70%',
  },
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.30)',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontStyle: 'italic',
  },
  openSourceBtn: {
    backgroundColor: 'rgba(0, 212, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.30)',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: RADIUS.sm,
  },
  openSourceText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});

export default PDFViewer;
