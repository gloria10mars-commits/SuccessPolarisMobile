// PDFViewer - Version React Native (CORRIGÉ)
// Lecteur de Documents avec 3 modes : Fichier Local (hors-ligne), Drive Natif, Lecteur Universel.
// Détection automatique des erreurs HTTP + timeout 15s + auto-bascule + blocage navigation externe.

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import WebView from 'react-native-webview';
import { Document } from '../types';
import { storageService } from '../services/storageService';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface PDFViewerProps {
  doc: Document | null;
  onClose: () => void;
}

type EngineMode = 'local' | 'drive' | 'universal';

const LOAD_TIMEOUT_MS = 15000; // 15 secondes max pour charger

const PDFViewer: React.FC<PDFViewerProps> = ({ doc, onClose }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [engineMode, setEngineMode] = useState<EngineMode>('drive');
  const [localFilePath, setLocalFilePath] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [autoSwitched, setAutoSwitched] = useState(false); // Évite la boucle d'auto-bascule
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialUrlRef = useRef<string>('');

  // Réinitialise l'état quand le document change
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setErrorMsg('');
    setAutoSwitched(false);
    setLocalFilePath(null);

    // Vérifie si le fichier existe localement (mode hors-ligne)
    if (doc) {
      checkLocalFile(doc);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [doc]);

  // Vérifie si le PDF est déjà téléchargé localement
  const checkLocalFile = async (document: Document) => {
    const isLocal = await storageService.isPdfDownloaded(document.id);
    if (isLocal) {
      const path = storageService.getLocalPdfPath(document.id);
      setLocalFilePath(path);
      setEngineMode('local');
    } else {
      setEngineMode('drive');
    }
  };

  if (!doc) return null;

  // Calcul des URLs selon le moteur
  const driveUrl = storageService.getDrivePreviewUrl(doc.fileUrl);
  const universalUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(doc.fileUrl)}`;

  const getCurrentUrl = (): string => {
    if (engineMode === 'local' && localFilePath) {
      return localFilePath;
    }
    if (engineMode === 'drive') return driveUrl;
    return universalUrl;
  };

  const currentUrl = getCurrentUrl();
  const isLocalMode = engineMode === 'local' && !!localFilePath;

  // Démarre le timeout de chargement
  const startLoadTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!isLoaded) {
        console.warn('⏱️ Timeout de chargement WebView dépassé');
        setHasError(true);
        setErrorMsg('Le chargement a expiré (15s). Le réseau est trop lent ou indisponible.');
        setIsLoaded(true);
        tryAutoSwitch();
      }
    }, LOAD_TIMEOUT_MS);
  }, [isLoaded]);

  // Auto-bascule vers le moteur suivant en cas d'erreur
  const tryAutoSwitch = useCallback(() => {
    if (autoSwitched) return; // Évite les boucles
    setAutoSwitched(true);

    if (engineMode === 'local') {
      // Si le fichier local échoue, on essaie le Drive en ligne
      console.log('🔄 Auto-bascule: local → drive');
      setEngineMode('drive');
      setIsLoaded(false);
      setHasError(false);
    } else if (engineMode === 'drive') {
      // Si Drive échoue, on essaie le Lecteur Universel
      console.log('🔄 Auto-bascule: drive → universal');
      setEngineMode('universal');
      setIsLoaded(false);
      setHasError(false);
    } else {
      // Si l'universel échoue aussi, on reste sur l'erreur
      console.log('❌ Tous les moteurs ont échoué');
    }
  }, [engineMode, autoSwitched]);

  // Bascule manuelle de moteur
  const toggleEngine = () => {
    setAutoSwitched(false); // Réautorise l'auto-bascule après une bascule manuelle
    setIsLoaded(false);
    setHasError(false);
    setErrorMsg('');

    if (engineMode === 'local') {
      setEngineMode('drive');
    } else if (engineMode === 'drive') {
      setEngineMode(localFilePath ? 'local' : 'universal');
    } else {
      setEngineMode('drive');
    }
  };

  // Télécharge le fichier pour usage hors-ligne
  const handleDownloadForOffline = async () => {
    setIsDownloading(true);
    try {
      const result = await storageService.downloadPdfFile(doc);
      if (result.success && result.localPath) {
        setLocalFilePath(result.localPath);
        setEngineMode('local');
        setIsLoaded(false);
        setHasError(false);
        Alert.alert('✅ Téléchargé', 'Le fichier est maintenant disponible hors-ligne.');
      } else {
        Alert.alert('❌ Échec', `Impossible de télécharger le fichier: ${result.error || 'erreur inconnue'}`);
      }
    } catch (e: any) {
      Alert.alert('❌ Erreur', e?.message || 'Erreur lors du téléchargement');
    } finally {
      setIsDownloading(false);
    }
  };

  // Gestion des erreurs WebView (réseau + HTTP)
  const handleWebViewError = (e: any) => {
    console.warn('🔴 WebView onError:', e.nativeEvent);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHasError(true);
    setErrorMsg(`Erreur réseau: ${e.nativeEvent?.description || 'connexion impossible'}`);
    setIsLoaded(true);
    tryAutoSwitch();
  };

  const handleHttpError = (e: any) => {
    console.warn('🟠 WebView onHttpError:', e.nativeEvent);
    const status = e.nativeEvent?.statusCode;
    // On ne traite que les vraies erreurs HTTP (pas les 3xx redirects)
    if (status >= 400) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setHasError(true);
      setErrorMsg(`Erreur HTTP ${status}: ${e.nativeEvent?.description || 'le serveur a refusé la demande'}`);
      setIsLoaded(true);
      tryAutoSwitch();
    }
  };

  const handleLoad = () => {
    console.log('✅ WebView loaded:', engineMode);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsLoaded(true);
  };

  const handleLoadStart = () => {
    console.log('🔄 WebView loadStart:', engineMode);
    if (!isLoaded) {
      startLoadTimeout();
    }
  };

  // Bloque TOUTE navigation externe (zéro fuite de données)
  // Seules les URLs du même domaine que l'URL initiale sont autorisées
  const shouldStartLoadWithRequest = (request: any): boolean => {
    const url = request.url || '';

    // Bloque les schémas externes
    if (
      url.startsWith('intent://') ||
      url.startsWith('market://') ||
      url.startsWith('android-app://') ||
      url.startsWith('tel:') ||
      url.startsWith('mailto:') ||
      url.startsWith('whatsapp://') ||
      url.startsWith('tg://') ||
      url.startsWith('fb://')
    ) {
      return false;
    }

    // En mode local (file://), bloque toute navigation vers le web
    if (isLocalMode && !url.startsWith('file://')) {
      return false;
    }

    // Pour les modes en ligne, autorise seulement les domaines Google nécessaires
    if (!isLocalMode) {
      const allowedDomains = [
        'drive.google.com',
        'docs.google.com',
        'googleusercontent.com',
        'accounts.google.com',
        'ssl.gstatic.com',
        'www.gstatic.com',
      ];
      const isAllowed = allowedDomains.some((domain) => url.includes(domain));
      if (!isAllowed && url !== currentUrl) {
        return false;
      }
    }

    return true;
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

        {/* Barre de sélection de Moteur */}
        <View style={styles.engineBar}>
          <View style={styles.engineInfo}>
            <Text style={styles.engineLabel}>
              Moteur actif :{' '}
              <Text style={styles.engineValue}>
                {engineMode === 'local' ? '📂 Fichier Local (Hors-ligne)' :
                 engineMode === 'drive' ? '1. Drive Natif' :
                 '2. Lecteur Universel'}
              </Text>
            </Text>
            {localFilePath && engineMode !== 'local' && (
              <Text style={styles.offlineBadge}>📦 Fichier hors-ligne disponible</Text>
            )}
          </View>
          <View style={styles.engineActions}>
            <TouchableOpacity
              style={[styles.engineBtn, styles.downloadBtn, isDownloading && styles.downloadBtnActive]}
              onPress={handleDownloadForOffline}
              disabled={isDownloading}
              activeOpacity={0.7}
            >
              <Text style={styles.engineBtnText}>
                {isDownloading ? '⏳ Téléchargement...' : '⬇️ Hors-ligne'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.engineBtn} onPress={toggleEngine} activeOpacity={0.7}>
              <Text style={styles.engineBtnText}>🔄 Changer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {!isLoaded && !hasError && (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loaderText}>
                {isDownloading ? 'Téléchargement du fichier...' : 'Chargement du Visionneur...'}
              </Text>
              <Text style={styles.loaderSub}>
                Moteur: {engineMode === 'local' ? 'Fichier Local' :
                         engineMode === 'drive' ? 'Drive Natif' : 'Lecteur Universel'}
              </Text>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
            </View>
          )}

          {hasError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorTitle}>
                Le Moteur {engineMode === 'local' ? 'Local' :
                           engineMode === 'drive' ? '1 (Drive Natif)' : '2 (Universel)'} est indisponible
              </Text>
              <Text style={styles.errorDesc}>{errorMsg}</Text>
              <Text style={styles.errorHint}>
                {autoSwitched
                  ? '💡 Vous pouvez essayer un autre moteur manuellement, ou télécharger le fichier pour un usage hors-ligne.'
                  : '💡 Bascule automatique vers le moteur suivant en cours...'}
              </Text>
              <View style={styles.errorActions}>
                <TouchableOpacity style={styles.switchRetryBtn} onPress={toggleEngine} activeOpacity={0.7}>
                  <Text style={styles.switchRetryBtnText}>
                    🔄 Essayer {engineMode === 'local' ? 'Drive' :
                                 engineMode === 'drive' ? 'Universel' : 'Drive'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.switchRetryBtn, styles.downloadActionBtn]}
                  onPress={handleDownloadForOffline}
                  disabled={isDownloading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.switchRetryBtnText}>
                    ⬇️ Télécharger pour hors-ligne
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <WebView
              key={`${engineMode}-${localFilePath || 'online'}`}
              source={isLocalMode
                ? { uri: `file://${localFilePath}`, headers: { 'Cache-Control': 'no-cache' } }
                : { uri: currentUrl }
              }
              style={[styles.webview, { opacity: isLoaded ? 1 : 0 }]}
              onLoadStart={handleLoadStart}
              onLoad={handleLoad}
              onError={handleWebViewError}
              onHttpError={handleHttpError}
              userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
              domStorageEnabled={true}
              javaScriptEnabled={true}
              thirdPartyCookiesEnabled={false}
              sharedCookiesEnabled={false}
              mixedContentMode="never"
              allowFileAccess={isLocalMode}
              allowUniversalAccessFromFileURLs={false}
              originWhitelist={['https://*', 'file://*']}
              onShouldStartLoadWithRequest={shouldStartLoadWithRequest}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              cacheMode={isLocalMode ? 'LOAD_NO_CACHE' : 'LOAD_DEFAULT'}
              renderError={(errorDomain: string, errorCode: number, errorDesc: string) => (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                  <Text style={styles.errorTitle}>Erreur de chargement</Text>
                  <Text style={styles.errorDesc}>{errorDesc || `Code ${errorCode}`}</Text>
                  <TouchableOpacity style={styles.switchRetryBtn} onPress={toggleEngine} activeOpacity={0.7}>
                    <Text style={styles.switchRetryBtnText}>🔄 Changer de Moteur</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isLocalMode ? COLORS.success : COLORS.primary }]} />
            <Text style={styles.statusText}>
              {isLocalMode
                ? 'Canal Hors-ligne // Fichier Local Sécurisé'
                : 'Canal En-ligne // Lecture Interne'}
            </Text>
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
  engineInfo: {
    flex: 1,
    flexDirection: 'column',
    gap: 2,
  },
  engineLabel: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 10,
  },
  engineValue: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  offlineBadge: {
    color: COLORS.success,
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  engineActions: {
    flexDirection: 'row',
    gap: 6,
  },
  engineBtn: {
    backgroundColor: 'rgba(0, 212, 255, 0.20)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  downloadBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.20)',
    borderColor: COLORS.success,
  },
  downloadBtnActive: {
    opacity: 0.5,
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
  loaderSub: {
    color: 'rgba(255, 255, 255, 0.30)',
    fontSize: 9,
    fontWeight: 'bold',
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
  errorHint: {
    color: 'rgba(0, 212, 255, 0.50)',
    fontSize: 10,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  errorActions: {
    flexDirection: 'column',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  switchRetryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: RADIUS.sm,
    minWidth: 250,
    alignItems: 'center',
  },
  downloadActionBtn: {
    backgroundColor: COLORS.success,
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
