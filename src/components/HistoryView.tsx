// HistoryView - Version React Native
// Affiche l'historique des documents consultés/vus, avec un délai d'auto-suppression de 3 jours (72h).

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { ViewHistoryItem, Document } from '../types';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface HistoryViewProps {
  history: ViewHistoryItem[];
  onPreview: (doc: Document) => void;
  onRemove: (docId: string) => void;
  onClearAll: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onPreview,
  onRemove,
  onClearAll,
}) => {
  const handleConfirmClear = () => {
    Alert.alert(
      'Effacer l\'Historique',
      'Voulez-vous vraiment effacer tout votre historique de consultation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Effacer Tout', style: 'destructive', onPress: onClearAll },
      ]
    );
  };

  const getRemainingTimeText = (viewedAt: number): string => {
    const elapsedMs = Date.now() - viewedAt;
    const totalDurationMs = 3 * 24 * 60 * 60 * 1000; // 3 jours en ms
    const remainingMs = Math.max(0, totalDurationMs - elapsedMs);
    const hoursLeft = Math.floor(remainingMs / (1000 * 60 * 60));
    if (hoursLeft >= 24) {
      const daysLeft = Math.floor(hoursLeft / 24);
      return `Expire dans ${daysLeft}j (${hoursLeft}h)`;
    }
    return `Expire dans ${hoursLeft}h`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>🕒 HISTORIQUE DES DOCUMENTS VUS</Text>
          <Text style={styles.subtitle}>
            Rétention automatique de 3 jours (72h) avant auto-suppression
          </Text>
        </View>

        {history.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleConfirmClear}
            activeOpacity={0.7}
          >
            <Text style={styles.clearBtnText}>Effacer</Text>
          </TouchableOpacity>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>⏳</Text>
          <Text style={styles.emptyTitle}>Historique Vide</Text>
          <Text style={styles.emptyText}>
            Les documents que vous consultez s'affichent ici et sont automatiquement purgés après 3 jours d'inactivité.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {history.map((item) => (
            <View key={item.doc.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <Text style={styles.iconText}>👁️</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.docTitle} numberOfLines={2}>
                    {item.doc.title}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.dateText}>
                      Vu le {new Date(item.viewedAt).toLocaleDateString('fr-FR')} à{' '}
                      {new Date(item.viewedAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    <View style={styles.expiryBadge}>
                      <Text style={styles.expiryText}>{getRemainingTimeText(item.viewedAt)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <Text style={styles.docDesc} numberOfLines={2}>
                {item.doc.description}
              </Text>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.openBtn}
                  onPress={() => onPreview(item.doc)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.openBtnText}>Ouvrir à nouveau</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onRemove(item.doc.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteBtnText}>Retirer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    color: 'rgba(245, 158, 11, 1)',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.40)',
    fontSize: 10,
    marginTop: 4,
  },
  clearBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.40)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
  },
  clearBtnText: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xxl,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.40)',
    fontSize: 11,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 18,
  },
  list: {
    gap: SPACING.md,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  infoBox: {
    flex: 1,
  },
  docTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 10,
  },
  expiryBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.20)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: RADIUS.pill,
  },
  expiryText: {
    color: 'rgba(245, 158, 11, 1)',
    fontSize: 9,
    fontWeight: 'bold',
  },
  docDesc: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: SPACING.md,
    fontStyle: 'italic',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  openBtn: {
    flex: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  openBtnText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default HistoryView;
