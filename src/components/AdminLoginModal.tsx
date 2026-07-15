// AdminLoginModal - Version React Native
// Porte dérobée d'authentification admin (code secret)

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface AdminLoginModalProps {
  visible: boolean;
  onConfirm: (code: string) => void;
  onCancel: () => void;
  hasError?: boolean;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  hasError,
}) => {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    onConfirm(code);
    setCode('');
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity onPress={onCancel} style={styles.closeBtn} activeOpacity={0.7}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.iconWrapper}>
            <Text style={styles.iconText}>🔑</Text>
          </View>

          <Text style={styles.title}>Authentification</Text>

          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Code secret..."
            placeholderTextColor="rgba(255, 255, 255, 0.20)"
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            onSubmitEditing={handleSubmit}
          />

          {hasError && (
            <Text style={styles.errorText}>Code Invalide</Text>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.confirmBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.confirmBtnText}>S'authentifier</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.20)',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: 'rgba(255, 255, 255, 0.30)',
    fontSize: 22,
  },
  iconWrapper: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(0, 212, 255, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  iconText: {
    fontSize: 28,
  },
  title: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    letterSpacing: 3,
    marginBottom: SPACING.xl,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    color: '#ffffff',
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  confirmBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
});

export default AdminLoginModal;
