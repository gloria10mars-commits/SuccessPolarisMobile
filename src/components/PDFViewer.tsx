// PDFViewer - Version React Native
// Lecteur et Visionneur de Documents intégré (Zéro ouverture externe).
// Dispose de 2 moteurs de lecture (Drive Natif & Lecteur Universel) avec bascule instantanée en cas d'erreur réseau/DNS.

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
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
  const [hasError, setHasError] = useState(false);
  const [engineMode, setEngineMode] = useState<'drive' | 'universal'>('drive');

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setEngineMode('drive'); // Par défaut Mode Drive Natif
  }, [doc]);

  if (!doc) return null;

  const driveUrl = storageService.getDrivePreviewUrl(doc.fileUrl);
  const universalUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(doc.fileUrl)}`;
  const currentUrl = engineMode === 'drive' ? driveUrl : universalUrl;

  const toggleEngine = () => {
    setHasError(false);
    setIsLoaded(false);
    setEngineMode((prev) => (prev === 'drive' ? 'universal' : 'drive'));
  };

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
              <Text style={styles.headerLabel}>Visionneur Astral de Documents</Text>
              <Text style={styles.headerDocTitle} numberOfLines={1}>{doc.title}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Barre de sélection de Moteur (Permet de basculer en cas d'erreur de DNS ou de redirection) */}
        <View style={styles.engineBar}>
          <Text style={styles.engineLabel}>
            Moteur actif : <Text style={styles.engineValue}>{engineMode === 'drive' ? '1. Drive Natif' : '2. Lecteur Universel'}</Text>
          </Text>
          <TouchableOpacity style={styles.engineBtn} onPress={toggleEngine} activeOpacity={0.7}>
            <Text style={styles.engineBtnText}>🔄 Changer de Moteur</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {!isLoaded && !hasError && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loaderText}>Chargement du Visionneur...</Text>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>
          )}

          {hasError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>Le Moteur {engineMode === 'drive' ? '1 (Drive Natif)' : '2 (Universel)'} est indisponible</Text>
              <Text style={styles.errorDesc}>
                Si votre réseau bloque ce format de lecture ou si le DNS Drive ne répond pas, basculez immédiatement sur l'autre moteur de lecture.
              </Text>
              <TouchableOpacity style={styles.switchRetryBtn} onPress={toggleEngine} activeOpacity={0.7}>
                <Text style={styles.switchRetryBtnText}>
                  👉 Basculer sur le Moteur {engineMode === 'drive' ? '2 (Lecteur Universel)' : '1 (Drive Natif)'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              key={engineMode} // Force re-render lors du changement de moteur
              source={{ uri: currentUrl }}
              style={[styles.webview, { opacity: isLoaded ? 1 : 0 }]}
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                console.warn('WebView error:', e.nativeEvent);
                setHasError(true);
                setIsLoaded(true);
              }}
              userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
              domStorageEnabled={true}
              javaScriptEnabled={true}
              thirdPartyCookiesEnabled={true}
              sharedCookiesEnabled={true}
              mixedContentMode="always"
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
              originWhitelist={['*']}
              onShouldStartLoadWithRequest={(request) => {
                if (
                  request.url.startsWith('intent://') ||
                  request.url.startsWith('market://') ||
                  request.url.startsWith('android-app://')
                ) {
                  return false;
                }
                return true;
              }}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Canal Sécurisé Léon Astarte // Lecture 100% Interne</Text>
          </View>
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
  engineBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 212, 255, 0.20)',
  },
  engineLabel: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 10,
  },
  engineValue: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  engineBtn: {
    backgroundColor: 'rgba(0, 212, 255, 0.20)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  engineBtnText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: '900',
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
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  errorIcon: {
    fontSize: 48,
  },
  errorTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorDesc: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  switchRetryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
  },
  switchRetryBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  footer: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: 'rgba(255, 255, 255, 0.40)',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontStyle: 'italic',
  },
});

export default PDFViewer;
