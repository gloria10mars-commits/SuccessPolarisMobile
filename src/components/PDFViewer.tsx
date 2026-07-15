// PDFViewer - Version React Native (WebView)
// Affiche l'aperçu PDF (Google Drive ou externe) sans option d'ouverture dans un navigateur externe.
// Configure le User-Agent Desktop et domStorage pour éviter net::ERR_NAME_NOT_RESOLVED (redirection intent://).

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

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
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
          {!isLoaded && !hasError && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loaderText}>Décodage du Flux Astral...</Text>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>
          )}

          {hasError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>Erreur de Chargement du Flux</Text>
              <Text style={styles.errorDesc}>
                Le document n'a pas pu être affiché directement. Vérifiez votre connexion internet ou le statut de l'archive.
              </Text>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => {
                  setHasError(false);
                  setIsLoaded(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.retryBtnText}>Réessayer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <WebView
              source={{ uri: previewUrl }}
              style={[styles.webview, { opacity: isLoaded ? 1 : 0 }]}
              onLoad={() => setIsLoaded(true)}
              onError={(e) => {
                console.warn('WebView error:', e.nativeEvent);
                setHasError(true);
                setIsLoaded(true);
              }}
              onHttpError={(e) => {
                console.warn('WebView http error:', e.nativeEvent);
                // On ne bloque pas si c'est une alerte HTTP mineure sauf si la page est blanche
              }}
              // User-Agent de type PC Desktop pour forcer Google Drive à afficher la vue web au lieu d'appeler l'application via intent://
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
                // Intercepter les schémas intent:// ou market:// qui provoquent net::ERR_NAME_NOT_RESOLVED / Domain: undefined
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

        {/* Footer - Sans option d'ouverture externe */}
        <View style={styles.footer}>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Canal Sécurisé Léon Astarte // Lecture Interne</Text>
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
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.sm,
  },
  retryBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
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
