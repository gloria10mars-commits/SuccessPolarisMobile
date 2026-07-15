// EmailModal - Version React Native
// Modal d'enregistrement utilisateur (email + pays)

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { COUNTRIES } from '../constants';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

interface EmailModalProps {
  visible: boolean;
  initialEmail?: string;
  initialCountry?: string;
  onConfirm: (email: string, country: string) => void;
  onCancel?: () => void;
}

const EmailModal: React.FC<EmailModalProps> = ({
  visible,
  initialEmail = '',
  initialCountry = 'Togo',
  onConfirm,
  onCancel,
}) => {
  const [email, setEmail] = useState(initialEmail);
  const [country, setCountry] = useState(initialCountry);

  const handleConfirm = () => {
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      Alert.alert('Identité invalide', 'Veuillez saisir une adresse @gmail.com valide.');
      return;
    }
    onConfirm(email, country);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Initialisation du Canal</Text>
          <Text style={styles.subtitle}>
            Confirmez votre identité pour accéder à Léon Astarte.
          </Text>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="votre-id@gmail.com"
            placeholderTextColor="rgba(255, 255, 255, 0.20)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          <View style={styles.pickerWrapper}>
            {COUNTRIES.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCountry(c)}
                style={[
                  styles.pickerItem,
                  country === c && styles.pickerItemActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    country === c && styles.pickerItemTextActive,
                  ]}
                >
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            style={styles.confirmBtn}
            activeOpacity={0.7}
          >
            <Text style={styles.confirmBtnText}>Accéder</Text>
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
    maxWidth: 380,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 255, 0.20)',
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    color: 'rgba(0, 212, 255, 0.40)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: SPACING.xl,
    textAlign: 'center',
    lineHeight: 16,
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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  pickerWrapper: {
    width: '100%',
    maxHeight: 240,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: RADIUS.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
  },
  pickerItemActive: {
    backgroundColor: 'rgba(0, 212, 255, 0.20)',
    borderColor: COLORS.primary,
  },
  pickerItemText: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pickerItemTextActive: {
    color: '#ffffff',
  },
  confirmBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default EmailModal;
