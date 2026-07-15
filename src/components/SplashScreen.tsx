// SplashScreen - Version React Native
// Page blanche d'initialisation affichant SUCCESS POLARIS en grand caractère bleu néon et créé par Astarte Studio.

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

interface SplashScreenProps {
  onFinish?: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      if (onFinish) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }).start(() => onFinish());
      }
    }, 2800);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Animated.View style={[styles.content, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.title}>SUCCESS POLARIS</Text>
        <View style={styles.separator} />
        <Text style={styles.subtitle}>créé par Astarte Studio</Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#00d4ff',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 212, 255, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
    marginBottom: 16,
  },
  separator: {
    width: 60,
    height: 3,
    backgroundColor: '#00d4ff',
    borderRadius: 2,
    marginBottom: 18,
    opacity: 0.8,
  },
  subtitle: {
    color: '#020617',
    fontSize: 15,
    fontWeight: 'bold',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

export default SplashScreen;
