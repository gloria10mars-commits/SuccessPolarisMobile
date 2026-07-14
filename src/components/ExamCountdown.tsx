// ExamCountdown - Version React Native
// Affiche le nombre de jours avant le BAC et sert de porte dérobée vers l'admin.

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

interface ExamCountdownProps {
  onAdminAccess?: () => void;
}

const ExamCountdown: React.FC<ExamCountdownProps> = ({ onAdminAccess }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const targetDate = new Date('2025-06-16T08:00:00');

  useEffect(() => {
    const calculate = () => {
      const diff = targetDate.getTime() - new Date().getTime();
      setTimeLeft(Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24))));
    };

    calculate();
    const timer = setInterval(calculate, 3600000);
    return () => clearInterval(timer);
  }, []);

  return (
    <TouchableOpacity
      onPress={onAdminAccess}
      activeOpacity={0.7}
      style={styles.container}
    >
      <View style={styles.row}>
        <Text style={styles.counter}>J-{timeLeft}</Text>
        <Text style={styles.label}>Avant le BAC</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 8,
    left: '50%',
    transform: [{ translateX: -75 }],
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.10)',
    width: 150,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  counter: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.60)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontStyle: 'italic',
  },
});

export default ExamCountdown;
