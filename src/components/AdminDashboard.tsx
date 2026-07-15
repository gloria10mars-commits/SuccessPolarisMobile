// AdminDashboard - Version React Native

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Category, Document, AdminAccount } from '../types';
import AdminStats from './AdminStats';
import { storageService } from '../services/storageService';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface AdminDashboardProps {
  categories: Category[];
  documents: Document[];
  currentAdmin: AdminAccount | null;
  onRefresh?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  categories,
  documents,
  currentAdmin,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'architect' | 'logs'>('status');
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    storageService.getLogs().then(setLogs);
  }, [activeTab]);

  const tabs = [
    { id: 'status', label: 'Matrice', icon: '📡' },
    { id: 'architect', label: 'Architecte', icon: '🏛️' },
    { id: 'logs', label: 'Logs', icon: '📟' },
  ] as const;

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive,
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'status' && <AdminStats />}

        {activeTab === 'architect' && (
          <View style={styles.architectContainer}>
            <Text style={styles.architectIcon}>🛠️</Text>
            <Text style={styles.architectTitle}>Module Architecte</Text>
            <Text style={styles.architectDesc}>
              Configuration des secteurs et de la structure du Palais Astral.
            </Text>
            <View style={styles.architectBox}>
              <Text style={styles.architectBoxText}>
                La structure est synchronisée avec la source externe (Google Sheets).{'\n'}
                {documents.length} archives actives sur {categories.length} secteurs.
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'logs' && (
          <View style={styles.logsContainer}>
            <Text style={styles.logsTitle}>Flux de Systèmes</Text>
            <View style={styles.logsBox}>
              {logs.length === 0 && (
                <Text style={styles.logsEmpty}>Aucun log système disponible.</Text>
              )}
              {logs.map((log) => (
                <View key={log.id} style={styles.logItem}>
                  <Text style={styles.logText}>
                    <Text style={styles.logTime}>[{log.timestamp}]</Text>{' '}
                    <Text style={styles.logAction}>{log.action}</Text>: {log.details}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(2, 6, 23, 0.4)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    minHeight: 600,
    flex: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.10)',
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  tabIcon: {
    fontSize: 14,
  },
  tabLabel: {
    color: 'rgba(255, 255, 255, 0.30)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  tabLabelActive: {
    color: '#ffffff',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING.lg,
  },
  architectContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  architectIcon: {
    fontSize: 48,
    color: COLORS.primary,
    opacity: 0.2,
    marginBottom: SPACING.lg,
  },
  architectTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 4,
    marginBottom: SPACING.md,
  },
  architectDesc: {
    color: 'rgba(255, 255, 255, 0.20)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  architectBox: {
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: RADIUS.lg,
    maxWidth: 380,
  },
  architectBoxText: {
    color: 'rgba(255, 255, 255, 0.40)',
    fontSize: 11,
    fontStyle: 'italic',
    lineHeight: 18,
    textAlign: 'center',
  },
  logsContainer: {
    gap: SPACING.md,
  },
  logsTitle: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
  },
  logsBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    gap: 6,
    maxHeight: 400,
  },
  logsEmpty: {
    color: 'rgba(255, 255, 255, 0.10)',
    fontSize: 9,
    fontStyle: 'italic',
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: 6,
  },
  logText: {
    color: 'rgba(255, 255, 255, 0.40)',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  logTime: {
    color: COLORS.primary,
  },
  logAction: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default AdminDashboard;
