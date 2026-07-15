// DownloadsView - Version React Native
// Affiche la liste des documents téléchargés et conservés dans le cache interne de l'application.
// L'utilisateur peut les consulter hors-ligne ou décider de les supprimer de son cache local.

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { CachedDownload, Document } from '../types';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface DownloadsViewProps {
  downloads: CachedDownload[];
  onPreview: (doc: Document) => void;
  onRemove: (docId: string) => void;
  onClearAll: () => void;
}

const DownloadsView: React.FC<DownloadsViewProps> = ({
  downloads,
  onPreview,
  onRemove,
  onClearAll,
}) => {
  const handleConfirmClear = () => {
    Alert.alert(
      'Vider le Cache de Téléchargement',
      'Voulez-vous vraiment supprimer tous les documents mis en cache ? Vous devrez les retélécharger en ligne si vous en avez besoin.',
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer Tout', style: 'destructive', onPress: onClearAll },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>📦 TÉLÉCHARGEMENTS EN CACHE</Text>
          <Text style={styles.subtitle}>
            Fichiers chiffrés et stockés en mémoire interne (Zéro accès extérieur)
          </Text>
        </View>

        {downloads.length > 0 && (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleConfirmClear}
            activeOpacity={0.7}
          >
            <Text style={styles.clearBtnText}>Tout Vider</Text>
          </TouchableOpacity>
        )}
      </View>

      {downloads.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyTitle}>Aucun Fichier en Cache</Text>
          <Text style={styles.emptyText}>
            Lorsque vous cliquez sur « Télécharger » sur un document, il est sauvegardé ici dans le cache hermétique de l'application.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {downloads.map((item) => (
            <View key={item.doc.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <Text style={styles.iconText}>📄</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.docTitle} numberOfLines={2}>
                    {item.doc.title}
                  </Text>
                  <Text style={styles.dateText}>
                    Téléchargé le {new Date(item.downloadedAt).toLocaleDateString('fr-FR')} à{' '}
                    {new Date(item.downloadedAt).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
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
                  <Text style={styles.openBtnText}>Ouvrir (Aperçu)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => onRemove(item.doc.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteBtnText}>Supprimer</Text>
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
    color: COLORS.primary,
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
    backgroundColor: 'rgba(0, 212, 255, 0.10)',
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
  dateText: {
    color: 'rgba(0, 212, 255, 0.60)',
    fontSize: 10,
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
    backgroundColor: COLORS.primary,
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
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.30)',
    paddingVertical: 12,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});

export default DownloadsView;
