// AuroraBackground - Version React Native
// Remplace le <canvas> web par un champ d'étoiles animées en Animated.View.
// Performance: 120 étoiles au lieu de 2000 (mobile), réparties aléatoirement.

import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

const generateStars = (count: number): Star[] => {
  return Array.from({ length: count }, () => ({
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() * 1.8 + 0.4,
    opacity: Math.random() * 0.7 + 0.2,
    duration: 2000 + Math.random() * 4000,
    delay: Math.random() * 4000,
  }));
};

const StarDot: React.FC<{ star: Star }> = ({ star }) => {
  const opacityAnim = useRef(new Animated.Value(star.opacity)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.1,
          duration: star.duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: star.opacity,
          duration: star.duration,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const timer = setTimeout(() => loop.start(), star.delay);
    return () => {
      clearTimeout(timer);
      loop.stop();
    };
  }, [star, opacityAnim]);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          opacity: opacityAnim,
        },
      ]}
    />
  );
};

const AuroraBackground: React.FC<{ style?: ViewStyle }> = ({ style }) => {
  const stars = useMemo(() => generateStars(120), []);

  return (
    <View style={[styles.container, style]} pointerEvents="none">
      <LinearGradient
        colors={['#020617', '#000000']}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {stars.map((star, i) => (
        <StarDot key={i} star={star} />
      ))}
      <View style={styles.mist} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
  },
  mist: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
});

export default AuroraBackground;
