// App.tsx - SuccessPolaris Mobile (React Native / Expo)
// Port 1:1 de la version web, adapté pour APK Android natif.
// Aucune référence à Gemini - IA: Léon Astarte Engine.

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
import EmailModal from './src/components/EmailModal';
import AdminLoginModal from './src/components/AdminLoginModal';

import { storageService } from './src/services/storageService';
import { Category, Document, AdminAccount } from './src/types';
import { COLORS, SPACING, RADIUS } from './src/theme/colors';

const ADMIN_SECRET_CODE = 'mazedxn7';

const App: React.FC = () => {
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
  const [viewMode, setViewMode] = useState<'archives' | 'library'>('archives');
  const [showSuccessAssistant, setShowSuccessAssistant] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const [viewerDoc, setViewerDoc] = useState<Document | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [userCountry, setUserCountry] = useState('Togo');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [pendingDoc, setPendingDoc] = useState<Document | null>(null);
  const [registrationIntent, setRegistrationIntent] = useState<
    'document' | 'assistant' | 'ai' | null
  >(null);

  const syncDocs = useCallback(async () => {
    setIsSyncing(true);
    try {
      const data = await storageService.fetchFromSheets();
      if (data.documents.length > 0) {
        setCategories(data.categories);
        setDocuments(data.documents);
        setTotalCount(data.documents.length);
      } else {
        const externalCount = await storageService.chargerCompteur();
        setTotalCount(externalCount);
      }
    } catch (err) {
      console.error('Sync Error:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncDocs();
    storageService.logVisit();
    storageService.getUserEmail().then((email) => {
      if (email) setUserEmail(email);
    });
    storageService.getUserCountry().then((country) => {
      if (country) setUserCountry(country);
    });
  }, [syncDocs]);

  const handlePreview = async (doc: Document) => {
    const email = await storageService.getUserEmail();
    storageService.logPreview(email, doc.title);
    setViewerDoc(doc);
  };

  const handleObtain = async (doc: Document) => {
    setPendingDoc(doc);
    setRegistrationIntent('document');
    const savedEmail = await storageService.getUserEmail();
    const savedCountry = await storageService.getUserCountry();

    if (!savedEmail) {
      setShowEmailModal(true);
    } else {
      const category = categories.find((c) => c.id === doc.categoryId);
      storageService.sendToCloudLog({
        type: 'ACCESS_DOCUMENT',
        email: savedEmail,
        country: savedCountry || 'Togo',
        docId: doc.id,
        docTitle: doc.title,
        category: category?.name,
        parentCategory: category?.parentId
          ? categories.find((c) => c.id === category.parentId)?.name
          : undefined,
      });
      processFullAccess(savedEmail, doc);
    }
  };

  const handleAssistantClick = async () => {
    const savedEmail = await storageService.getUserEmail();
    const savedCountry = await storageService.getUserCountry();

    if (!savedEmail) {
      setRegistrationIntent('assistant');
      setShowEmailModal(true);
    } else {
      storageService.sendToCloudLog({
        type: 'ACCESS_ASSISTANT',
        email: savedEmail,
        country: savedCountry || 'Togo',
      });
      setShowSuccessAssistant(true);
    }
  };

  const handleAIClick = async (): Promise<boolean> => {
    const savedEmail = await storageService.getUserEmail();
    const savedCountry = await storageService.getUserCountry();

    if (!savedEmail) {
      setRegistrationIntent('ai');
      setShowEmailModal(true);
      return false;
    }

    storageService.sendToCloudLog({
      type: 'ACCESS_AI',
      email: savedEmail,
      country: savedCountry || 'Togo',
    });
    setShowAI(true);
    return true;
  };

  const processFullAccess = async (email: string, doc: Document) => {
    const isBanned = await storageService.isEmailBanned(email);
    if (isBanned) {
      Alert.alert('Accès Révoqué', 'Votre identité a été bannie.');
      return;
    }
    storageService.logDownload(email, doc.title, doc.id);
    storageService.incrementDownload(doc.id);
    setViewerDoc(doc);
  };

  const handleIdentityConfirm = async (email: string, country: string) => {
    storageService.saveUserEmail(email);
    storageService.saveUserCountry(country);
    setUserEmail(email);
    setUserCountry(country);

    let logData: any = {
      email,
      country,
      timestamp: new Date().toISOString(),
    };

    if (registrationIntent === 'document' && pendingDoc) {
      logData.type = 'REGISTRATION_DOCUMENT';
      logData.docId = pendingDoc.id;
      logData.docTitle = pendingDoc.title;

      const category = categories.find((c) => c.id === pendingDoc.categoryId);
      if (category) {
        logData.category = category.name;
        if (category.parentId) {
          const parent = categories.find((c) => c.id === category.parentId);
          if (parent) logData.parentCategory = parent.name;
        }
      }

      storageService.sendToCloudLog(logData);
      processFullAccess(email, pendingDoc);
    } else if (registrationIntent === 'assistant') {
      logData.type = 'REGISTRATION_ASSISTANT';
      storageService.sendToCloudLog(logData);
      setShowSuccessAssistant(true);
    } else if (registrationIntent === 'ai') {
      logData.type = 'REGISTRATION_AI';
      storageService.sendToCloudLog(logData);
      setShowAI(true);
    }

    setShowEmailModal(false);
    setRegistrationIntent(null);
  };

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

  const displayedDocuments = useMemo(async () => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return documents.filter((d) => d.title.toLowerCase().includes(q));
    }
    if (viewMode === 'library') {
      const history = await storageService.getUserHistory();
      return documents.filter((doc) => history.includes(doc.id));
    }
    if (navigationPath.length === 0) return [];
    const lastCatId = navigationPath[navigationPath.length - 1].id;
    return documents.filter((doc) => doc.categoryId === lastCatId);
  }, [documents, navigationPath, searchQuery, viewMode]);

  // Comme useMemo async ne fonctionne pas, on utilise un state séparé.
  const [resolvedDocs, setResolvedDocs] = useState<Document[]>([]);
  useEffect(() => {
    displayedDocuments.then(setResolvedDocs);
  }, [displayedDocuments]);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
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

        <PDFViewer doc={viewerDoc} onClose={() => setViewerDoc(null)} />

        <SafeAreaView style={styles.safe}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {!isAdminMode ? (
              <>
                {/* Header */}
                <View style={styles.header}>
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

                {/* Search */}
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

                {/* Nav tabs */}
                {!searchQuery && (
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

                {/* Categories sidebar */}
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

                {/* Documents grid */}
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
                        onPreview={handlePreview}
                        onDownload={handleObtain}
                      />
                    ))
                  ) : (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyIcon}>📡</Text>
                      <Text style={styles.emptyText}>Aucune donnée</Text>
                    </View>
                  )}
                </View>
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
                  onRefresh={syncDocs}
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

        {/* Modals */}
        <EmailModal
          visible={showEmailModal}
          initialEmail={userEmail}
          initialCountry={userCountry}
          onConfirm={handleIdentityConfirm}
          onCancel={() => setShowEmailModal(false)}
        />

        <AdminLoginModal
          visible={showAdminLogin}
          onConfirm={handleAdminLogin}
          onCancel={() => setShowAdminLogin(false)}
          hasError={loginError}
        />
      </View>
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
    gap: SPACING.xl,
    marginBottom: SPACING.xl,
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
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
