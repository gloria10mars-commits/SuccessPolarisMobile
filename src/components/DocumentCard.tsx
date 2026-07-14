// DocumentCard - Version React Native

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Document } from '../types';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface DocumentCardProps {
  doc: Document;
  onDownload: (doc: Document) => void;
  onPreview: (doc: Document) => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ doc, onDownload, onPreview }) => {
  return (
    <View style={styles.card}>
      <View style={styles.glow} />

      <View style={styles.header}>
        <View style={styles.iconWrapper}>
          <Text style={styles.iconText}>📘</Text>
        </View>
        <Text style={styles.size}>{doc.size || 'PDF'}</Text>
      </View>

      <Text style={styles.title} numberOfLines={2}>{doc.title}</Text>
      <Text style={styles.description} numberOfLines={2}>"{doc.description}"</Text>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.previewBtn}
          onPress={() => onPreview(doc)}
          activeOpacity={0.7}
        >
          <Text style={styles.previewBtnText}>Aperçu</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.downloadBtn}
          onPress={() => onDownload(doc)}
          activeOpacity={0.7}
        >
          <Text style={styles.downloadBtnText}>Télécharger</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 212, 255, 0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 212, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
  },
  size: {
    color: 'rgba(0, 212, 255, 0.30)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
    lineHeight: 20,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.20)',
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: SPACING.lg,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  previewBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    paddingVertical: 14,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  previewBtnText: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  downloadBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
  },
  downloadBtnText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});

export default DocumentCard;
