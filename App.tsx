// App.tsx - SuccessPolaris Mobile (React Native / Expo)
// Port 1:1 de la version web, adapté pour APK Android natif.
// Page blanche d'initialisation SUCCESS POLARIS (Astarte Studio).
// Suppression du bouton Aperçu sur les cartes -> Uniquement "Télécharger le Document".
// Visionneur Astral à 2 moteurs (Drive Natif & Universel) en cas de blocage réseau/DNS.

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AuroraBackground from './src/components/AuroraBackground';
import ExamCountdown from './src/components/ExamCountdown';
import DocumentCard from './src/components/DocumentCard';
import PDFViewer from './src/components/PDFViewer';
import ChatWidget from './src/components/ChatWidget';
import SuccessPolarisAssistant from './src/components/SuccessPolarisAssistant';
import AdminDashboard from './src/components/AdminDashboard';
import AdminLoginModal from './src/components/AdminLoginModal';
import HamburgerMenu from './src/components/HamburgerMenu';
import DownloadsView from './src/components/DownloadsView';
import HistoryView from './src/components/HistoryView';
import SplashScreen from './src/components/SplashScreen';

import { storageService } from './src/services/storageService';
import { Category, Document, AdminAccount, CachedDownload, ViewHistoryItem } from './src/types';
import { COLORS, SPACING, RADIUS } from './src/theme/colors';

const ADMIN_SECRET_CODE = 'mazedxn7';

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [navigationPath, setNavigationPath] = useState<Category[]>([]);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminAccount | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [isSyncing, setIsSyncing] = useState(true);
  const [viewMode, setViewMode] = useState<'archives' | 'library' | 'downloads' | 'history'>('archives');
  const [showSuccessAssistant, setShowSuccessAssistant] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);

  const [viewerDoc, setViewerDoc] = useState<Document | null>(null);
  const [cachedDownloadsList, setCachedDownloadsList] = useState<CachedDownload[]>([]);
  const [viewHistoryList, setViewHistoryList] = useState<ViewHistoryItem[]>([]);

  // Téléchargement / vérification du cache Sheets au lancement (màj automatique hebdomadaire)
  const syncDocs = useCallback(async (force: boolean = false) => {
    setIsSyncing(true);
    try {
      const data = await storageService.fetchFromSheets(force);
      if (data.documents.length > 0) {
        setCategories(data.categories);
        setDocuments(data.documents);
        setTotalCount(data.documents.length);
      } else {
        const externalCount = await storageService.chargerCompteur();
        setTotalCount(externalCount);
      }
      const downloads = await storageService.getInternalDownloads();
      setCachedDownloadsList(downloads);
      const history = await storageService.getViewHistory();
      setViewHistoryList(history);
    } catch (err) {
      console.error('Sync Error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncDocs(false);
    storageService.logVisit();
  }, [syncDocs]);

  // Consultation directement dans le Visionneur Astral (depuis Téléchargements en cache ou Historique)
  const handlePreview = async (doc: Document) => {
    const email = (await storageService.getUserEmail()) || 'Utilisateur Libre';
    storageService.logPreview(email, doc.title);
    await storageService.addToViewHistory(doc);
    const updatedHistory = await storageService.getViewHistory();
    setViewHistoryList(updatedHistory);
    setViewerDoc(doc);
  };

  // Téléchargement dans le cache de l'application & Ouverture instantanée dans le Visionneur Astral
  const handleObtain = async (doc: Document) => {
    const email = (await storageService.getUserEmail()) || 'Utilisateur Libre';

    const isBanned = await storageService.isEmailBanned(email);
    if (isBanned) {
      Alert.alert('Accès Révoqué', 'Votre identité a été bannie.');
      return;
    }

    // Sauvegarde les métadonnées ET télécharge le fichier PDF en local
    const { list: updatedDownloads, downloadResult } = await storageService.saveToInternalDownloads(doc);
    setCachedDownloadsList(updatedDownloads);

    // Ajout à l'historique des vus (auto-suppression 3j)
    const updatedHistory = await storageService.addToViewHistory(doc);
    setViewHistoryList(updatedHistory);

    storageService.logDownload(email, doc.title, doc.id);
    storageService.incrementDownload(doc.id);

    if (downloadResult.success) {
      console.log('✅ PDF téléchargé localement:', downloadResult.localPath);
    } else {
      console.warn('⚠️ Téléchargement local échoué (ouverture en ligne):', downloadResult.error);
    }

    // Le fichier est lu par l'application jouant le rôle de visionneur de documents
    setViewerDoc(doc);
  };

  // Assistant & IA (Sans saisie d'email)
  const handleAssistantClick = async () => {
    const email = (await storageService.getUserEmail()) || 'Utilisateur Libre';
    const country = (await storageService.getUserCountry()) || 'Togo';
    storageService.sendToCloudLog({
      type: 'ACCESS_ASSISTANT',
      email,
      country,
    });
    setShowSuccessAssistant(true);
  };

  const handleAIClick = async (): Promise<boolean> => {
    const email = (await storageService.getUserEmail()) || 'Utilisateur Libre';
    const country = (await storageService.getUserCountry()) || 'Togo';
    storageService.sendToCloudLog({
      type: 'ACCESS_AI',
      email,
      country,
    });
    setShowAI(true);
    return true;
  };

  // Authentification terminal maître admin
  const handleAdminLogin = (code: string) => {
    if (code === ADMIN_SECRET_CODE) {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setLoginError(false);
      setCurrentAdmin({
        id: '0',
        username: 'Léon Astarte',
        role: 'SUPER_MASTER',
        lastLogin: new Date().toISOString(),
      });
    } else {
      setLoginError(true);
    }
  };

  const navigateTo = (cat: Category | null) => {
    setViewMode('archives');
    setNavigationPath(cat ? [...navigationPath, cat] : []);
    setSearchQuery('');
  };

  const currentLevelCategories = useMemo(() => {
    const parentId =
      navigationPath.length > 0 ? navigationPath[navigationPath.length - 1].id : null;
    return categories.filter((c) => c.parentId === parentId);
  }, [categories, navigationPath]);

  // CORRIGÉ: Remplacement du useMemo(async) anti-pattern par useEffect + useState
  // L'ancienne version créait une nouvelle Promise à chaque rendu et causait des race conditions.
  const [resolvedDocs, setResolvedDocs] = useState<Document[]>([]);

  useEffect(() => {
    let isMounted = true;

    const resolveDocs = async () => {
      let result: Document[] = [];

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        result = documents.filter(
          (d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
        );
      } else if (viewMode === 'library') {
        const historyIds = await storageService.getUserHistory();
        result = documents.filter((doc) => historyIds.includes(doc.id));
      } else if (viewMode === 'archives') {
        if (navigationPath.length === 0) {
          result = [];
        } else {
          const lastCatId = navigationPath[navigationPath.length - 1].id;
          result = documents.filter((doc) => doc.categoryId === lastCatId);
        }
      }
      // Pour 'downloads' et 'history', on ne filtre pas les documents ici
      // (ils sont gérés par les vues spécialisées)

      if (isMounted) {
        setResolvedDocs(result);
      }
    };

    resolveDocs();

    return () => {
      isMounted = false;
    };
  }, [documents, navigationPath, searchQuery, viewMode]);

  // Actions cache interne depuis le menu
  const handleRemoveDownload = async (docId: string) => {
    const updated = await storageService.removeInternalDownload(docId);
    setCachedDownloadsList(updated);
  };

  const handleClearAllDownloads = async () => {
    await storageService.clearInternalDownloads();
    setCachedDownloadsList([]);
  };

  const handleRemoveHistoryItem = async (docId: string) => {
    const updated = await storageService.removeViewHistoryItem(docId);
    setViewHistoryList(updated);
  };

  const handleClearAllHistory = async () => {
    await storageService.clearViewHistory();
    setViewHistoryList([]);
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={showSplash ? 'dark-content' : 'light-content'} backgroundColor={showSplash ? '#ffffff' : '#020617'} />
      
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <View style={styles.root}>
          <AuroraBackground />
          <ExamCountdown onAdminAccess={() => setShowAdminLogin(true)} />

          {!isAdminMode && (
            <ChatWidget
              documents={documents}
              onOpen={() => {
                handleAIClick();
                return true;
              }}
              isOpen={showAI}
              onClose={() => setShowAI(false)}
            />
          )}

          <SuccessPolarisAssistant
            isOpen={showSuccessAssistant}
            onClose={() => setShowSuccessAssistant(false)}
          />

          {/* Visionneur Astral de Documents */}
          <PDFViewer doc={viewerDoc} onClose={() => setViewerDoc(null)} />

          {/* Menu Hamburger */}
          <HamburgerMenu
            visible={showHamburger}
            onClose={() => setShowHamburger(false)}
            currentMode={viewMode}
            onSelectMode={(mode) => {
              setViewMode(mode);
              setSearchQuery('');
            }}
            onForceSync={() => syncDocs(true)}
          />

          <SafeAreaView style={styles.safe}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {!isAdminMode ? (
                <>
                  {/* Header avec bouton Hamburger */}
                  <View style={styles.header}>
                    <View style={styles.headerTopRow}>
                      <TouchableOpacity
                        style={styles.hamburgerBtn}
                        onPress={() => setShowHamburger(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.hamburgerIcon}>☰</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.logoWrapper}
                        onPress={() => navigateTo(null)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.logoBox}>
                          <Text style={styles.logoIcon}>⚛️</Text>
                        </View>
                        <Text style={styles.logoText}>
                          Success<Text style={styles.logoAccent}>Polaris</Text>
                        </Text>
                      </TouchableOpacity>

                      <View style={{ width: 44 }} />
                    </View>

                    <View style={styles.headerActions}>
                      <TouchableOpacity
                        onPress={handleAssistantClick}
                        style={styles.assistantBtn}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.assistantIcon}>🤖</Text>
                        <Text style={styles.assistantBtnText}>Assistant</Text>
                      </TouchableOpacity>

                      <View style={styles.counterBox}>
                        <View style={styles.counterIcon}>
                          <Text style={styles.counterIconText}>💾</Text>
                        </View>
                        <View>
                          <Text style={styles.counterLabel}>Flux Archives</Text>
                          <Text style={styles.counterValue}>{totalCount} items</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Recherche */}
                  <View style={styles.searchWrapper}>
                    <View style={styles.searchBox}>
                      <Text style={styles.searchIcon}>🔍</Text>
                      <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Explorer avec Léon Astarte..."
                        placeholderTextColor="rgba(255, 255, 255, 0.20)"
                        style={styles.searchInput}
                      />
                    </View>
                  </View>

                  {/* Nav tabs principale */}
                  {!searchQuery && viewMode !== 'downloads' && viewMode !== 'history' && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.navScroll}
                      contentContainerStyle={styles.navScrollContent}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          setViewMode('archives');
                          setNavigationPath([]);
                        }}
                        style={[
                          styles.navBtn,
                          viewMode === 'archives' && navigationPath.length === 0 && styles.navBtnActive,
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.navBtnText,
                            viewMode === 'archives' && navigationPath.length === 0 && styles.navBtnTextActive,
                          ]}
                        >
                          Secteurs
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setViewMode('library')}
                        style={[
                          styles.navBtn,
                          viewMode === 'library' && styles.navBtnActive,
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.navBtnText,
                            viewMode === 'library' && styles.navBtnTextActive,
                          ]}
                        >
                          Mon Index
                        </Text>
                      </TouchableOpacity>
                      {navigationPath.map((cat, i) => (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => setNavigationPath(navigationPath.slice(0, i + 1))}
                          style={styles.navBreadcrumb}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.navBreadcrumbText}>{cat.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}

                  {/* Affichage des Vues spécialisées */}
                  {viewMode === 'downloads' ? (
                    <DownloadsView
                      downloads={cachedDownloadsList}
                      onPreview={handlePreview}
                      onRemove={handleRemoveDownload}
                      onClearAll={handleClearAllDownloads}
                    />
                  ) : viewMode === 'history' ? (
                    <HistoryView
                      history={viewHistoryList}
                      onPreview={handlePreview}
                      onRemove={handleRemoveHistoryItem}
                      onClearAll={handleClearAllHistory}
                    />
                  ) : (
                    <>
                      {/* Categories sidebar / grid */}
                      {viewMode === 'archives' && !searchQuery && currentLevelCategories.length > 0 && (
                        <View style={styles.categoriesRow}>
                          {currentLevelCategories.map((cat) => (
                            <TouchableOpacity
                              key={cat.id}
                              onPress={() => navigateTo(cat)}
                              style={styles.categoryBtn}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.categoryText}>{cat.name}</Text>
                              <Text style={styles.categoryArrow}>›</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}

                      {/* Documents grid (Uniquement bouton Télécharger) */}
                      <View style={styles.docsGrid}>
                        {isSyncing ? (
                          <View style={styles.loadingBox}>
                            <ActivityIndicator size="large" color={COLORS.primary} />
                            <Text style={styles.loadingText}>Synchronisation...</Text>
                          </View>
                        ) : resolvedDocs.length > 0 ? (
                          resolvedDocs.map((doc) => (
                            <DocumentCard
                              key={doc.id}
                              doc={doc}
                              onDownload={handleObtain}
                            />
                          ))
                        ) : (
                          <View style={styles.emptyBox}>
                            <Text style={styles.emptyIcon}>📡</Text>
                            <Text style={styles.emptyText}>Aucune archive sélectionnée dans ce secteur</Text>
                          </View>
                        )}
                      </View>
                    </>
                  )}
                </>
              ) : (
                <View style={styles.adminWrapper}>
                  <View style={styles.adminHeader}>
                    <TouchableOpacity
                      onPress={() => setIsAdminMode(false)}
                      style={styles.exitAdminBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.exitAdminText}>← Quitter la Matrice</Text>
                    </TouchableOpacity>
                    <Text style={styles.adminHeaderLabel}>Terminal Maître</Text>
                  </View>
                  <AdminDashboard
                    categories={categories}
                    documents={documents}
                    currentAdmin={currentAdmin}
                    onRefresh={() => syncDocs(true)}
                  />
                </View>
              )}
            </ScrollView>
          </SafeAreaView>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerLeft}>POLARIS PROTOCOL // LÉON ASTARTE</Text>
            <Text style={styles.footerRight}>Système Sécurisé</Text>
          </View>

          {/* Modal Connexion Admin */}
          <AdminLoginModal
            visible={showAdminLogin}
            onConfirm={handleAdminLogin}
            onCancel={() => setShowAdminLogin(false)}
            hasError={loginError}
          />
        </View>
      )}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#020617',
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 120,
    paddingHorizontal: SPACING.md,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  headerTopRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hamburgerBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(0, 212, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hamburgerIcon: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  logoWrapper: {
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0, 212, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoIcon: {
    fontSize: 22,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: 2,
  },
  logoAccent: {
    color: COLORS.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  assistantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: 'rgba(0, 212, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.30)',
    borderRadius: RADIUS.md,
  },
  assistantIcon: {
    fontSize: 14,
  },
  assistantBtnText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
  },
  counterIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 212, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterIconText: {
    fontSize: 14,
  },
  counterLabel: {
    color: 'rgba(0, 212, 255, 0.60)',
    fontSize: 7,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  counterValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  searchWrapper: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    gap: 12,
  },
  searchIcon: {
    fontSize: 14,
    opacity: 0.3,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    paddingVertical: 14,
    fontWeight: '500',
  },
  navScroll: {
    flexGrow: 0,
    marginBottom: SPACING.lg,
  },
  navScrollContent: {
    gap: 8,
    paddingVertical: 4,
  },
  navBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  navBtnActive: {
    backgroundColor: COLORS.primary,
  },
  navBtnText: {
    color: 'rgba(255, 255, 255, 0.40)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  navBtnTextActive: {
    color: '#000000',
  },
  navBreadcrumb: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(0, 212, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.20)',
  },
  navBreadcrumbText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  categoryBtn: {
    flex: 1,
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: RADIUS.lg,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    flex: 1,
  },
  categoryArrow: {
    color: 'rgba(255, 255, 255, 0.20)',
    fontSize: 18,
  },
  docsGrid: {
    flexDirection: 'column',
    gap: SPACING.md,
    width: '100%',
  },
  loadingBox: {
    width: '100%',
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  emptyBox: {
    width: '100%',
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    gap: SPACING.md,
  },
  emptyIcon: {
    fontSize: 40,
    opacity: 0.1,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.30)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  adminWrapper: {
    flex: 1,
    paddingTop: 60,
  },
  adminHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  exitAdminBtn: {
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.10)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
  },
  exitAdminText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  adminHeaderLabel: {
    color: 'rgba(255, 255, 255, 0.20)',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  footerLeft: {
    color: 'rgba(0, 212, 255, 0.20)',
    fontSize: 7,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  footerRight: {
    color: 'rgba(255, 255, 255, 0.10)',
    fontSize: 7,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontStyle: 'italic',
  },
});

export default App;
