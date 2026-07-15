// HamburgerMenu - Version React Native
// Menu latéral permettant de naviguer vers les Téléchargements en cache et l'Historique (auto-suppression 3j).

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface HamburgerMenuProps {
  visible: boolean;
  onClose: () => void;
  currentMode: 'archives' | 'library' | 'downloads' | 'history';
  onSelectMode: (mode: 'archives' | 'library' | 'downloads' | 'history') => void;
  onForceSync: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  visible,
  onClose,
  currentMode,
  onSelectMode,
  onForceSync,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <SafeAreaView style={styles.drawer}>
          <View style={styles.header}>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerIcon}>☰</Text>
              <Text style={styles.headerTitle}>Menu Navigation</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>EXPLORATION</Text>

            <TouchableOpacity
              onPress={() => {
                onSelectMode('archives');
                onClose();
              }}
              style={[styles.menuItem, currentMode === 'archives' && styles.menuItemActive]}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemIconBox}>
                <Text style={styles.menuItemIcon}>🏠</Text>
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={[styles.menuItemTitle, currentMode === 'archives' && styles.menuItemTitleActive]}>
                  Secteurs & Archives
                </Text>
                <Text style={styles.menuItemSub}>Catalogue complet de la Matrice</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onSelectMode('library');
                onClose();
              }}
              style={[styles.menuItem, currentMode === 'library' && styles.menuItemActive]}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemIconBox}>
                <Text style={styles.menuItemIcon}>📚</Text>
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={[styles.menuItemTitle, currentMode === 'library' && styles.menuItemTitleActive]}>
                  Mon Index
                </Text>
                <Text style={styles.menuItemSub}>Vos documents fréquents</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>CACHE & STOCKAGE INTERNE</Text>

            <TouchableOpacity
              onPress={() => {
                onSelectMode('downloads');
                onClose();
              }}
              style={[styles.menuItem, currentMode === 'downloads' && styles.menuItemActive]}
              activeOpacity={0.7}
            >
              <View style={[styles.menuItemIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <Text style={styles.menuItemIcon}>⬇️</Text>
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={[styles.menuItemTitle, currentMode === 'downloads' && styles.menuItemTitleActive]}>
                  Téléchargements en Cache
                </Text>
                <Text style={styles.menuItemSub}>Stockage isolé et sécurisé 100% hors-ligne</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onSelectMode('history');
                onClose();
              }}
              style={[styles.menuItem, currentMode === 'history' && styles.menuItemActive]}
              activeOpacity={0.7}
            >
              <View style={[styles.menuItemIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Text style={styles.menuItemIcon}>🕒</Text>
              </View>
              <View style={styles.menuItemInfo}>
                <Text style={[styles.menuItemTitle, currentMode === 'history' && styles.menuItemTitleActive]}>
                  Historique des documents vus
                </Text>
                <Text style={styles.menuItemSub}>Auto-suppression après 3 jours</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>SYSTÈMES & BASE DE DONNÉES</Text>

            <TouchableOpacity
              onPress={() => {
                onForceSync();
                onClose();
              }}
              style={styles.syncCard}
              activeOpacity={0.7}
            >
              <Text style={styles.syncCardIcon}>🔄</Text>
              <View style={styles.syncCardText}>
                <Text style={styles.syncCardTitle}>Actualiser la Base (Sheet)</Text>
                <Text style={styles.syncCardSub}>
                  Téléchargement périodique automatique (chaque semaine). Appuyez pour forcer maintenant.
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.securityBox}>
              <Text style={styles.securityTitle}>🔒 ZÉRO ACCÈS EXTERNE</Text>
              <Text style={styles.securityDesc}>
                Conformément au protocole Polaris, les fichiers et la base Sheets sont encapsulés dans le cache chiffré de l'application. Aucun accès depuis l'extérieur du téléphone n'est possible.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerText}>LÉON ASTARTE ENGINE // v2.0</Text>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
  },
  drawer: {
    width: 310,
    backgroundColor: '#020617',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 212, 255, 0.20)',
    flexDirection: 'column',
  },
  header: {
    padding: SPACING.md,
    paddingTop: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerIcon: {
    fontSize: 20,
    color: COLORS.primary,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  sectionLabel: {
    color: 'rgba(0, 212, 255, 0.50)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },
  menuItemActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.30)',
  },
  menuItemIconBox: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(0, 212, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemIcon: {
    fontSize: 18,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemTitle: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: 'bold',
  },
  menuItemTitleActive: {
    color: COLORS.primary,
    fontWeight: '900',
  },
  menuItemSub: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 10,
    marginTop: 2,
  },
  syncCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
  },
  syncCardIcon: {
    fontSize: 22,
  },
  syncCardText: {
    flex: 1,
  },
  syncCardTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  syncCardSub: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 9,
    lineHeight: 14,
    marginTop: 2,
  },
  securityBox: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.15)',
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xl,
  },
  securityTitle: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  securityDesc: {
    color: 'rgba(255, 255, 255, 0.40)',
    fontSize: 9,
    lineHeight: 14,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.20)',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
  },
});

export default HamburgerMenu;
