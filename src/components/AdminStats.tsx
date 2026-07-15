// AdminStats - Version React Native (react-native-chart-kit)

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { storageService } from '../services/storageService';
import { COLORS, SPACING, RADIUS } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 64;

interface Stats {
  topDocs: any[];
  totalUniqueUsers: number;
  chartData: { date: string; downloads: number }[];
}

const AdminStats: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    storageService.getAdvancedStats().then(setStats);
  }, []);

  if (!stats) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Chargement de la matrice...</Text>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: '#020617',
    backgroundGradientTo: '#020617',
    color: (opacity = 1) => `rgba(0, 212, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    barPercentage: 0.6,
    propsForBackgroundLines: {
      stroke: 'rgba(255, 255, 255, 0.05)',
      strokeDasharray: '3 3',
    },
  };

  const barData = {
    labels: stats.chartData.map((d) => d.date.substring(0, 5)),
    datasets: [
      {
        data: stats.chartData.map((d) => d.downloads),
      },
    ],
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.cardsRow}>
        <View style={styles.usersCard}>
          <Text style={styles.cardLabel}>Élèves de la Matrice</Text>
          <Text style={styles.cardValue}>{stats.totalUniqueUsers}</Text>
          <Text style={styles.cardSub}>Identités Uniques</Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Activité (7j)</Text>
          <BarChart
            data={barData}
            width={CHART_WIDTH - 32}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            withInnerLines
            fromZero
            showValuesOnTopOfBars
            style={styles.chart}
          />
        </View>
      </View>

      <View style={styles.topCard}>
        <Text style={styles.topTitle}>Top 5 Archives Consultées</Text>
        {stats.topDocs.length === 0 && (
          <Text style={styles.emptyText}>Aucune donnée disponible.</Text>
        )}
        {stats.topDocs.map((doc, idx) => {
          const maxDownloads = stats.topDocs[0]?.downloads || 1;
          const pct = (doc.downloads / maxDownloads) * 100;
          return (
            <View key={doc.id} style={styles.topItem}>
              <Text style={styles.topNumber}>0{idx + 1}</Text>
              <View style={styles.topInfo}>
                <Text style={styles.topDocTitle} numberOfLines={1}>{doc.title}</Text>
                <Text style={styles.topDocStats}>{doc.downloads} accès autorisés</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%` }]} />
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: SPACING.md,
  },
  loading: {
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.primary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  cardsRow: {
    flexDirection: 'column',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  usersCard: {
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.lg,
    alignItems: 'center',
  },
  cardLabel: {
    color: 'rgba(255, 255, 255, 0.30)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: SPACING.sm,
  },
  cardValue: {
    color: COLORS.primary,
    fontSize: 36,
    fontWeight: '900',
  },
  cardSub: {
    color: 'rgba(255, 255, 255, 0.10)',
    fontSize: 8,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: 'rgba(2, 6, 23, 0.4)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.lg,
  },
  chartTitle: {
    color: 'rgba(255, 255, 255, 0.40)',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: SPACING.md,
  },
  chart: {
    borderRadius: RADIUS.md,
  },
  topCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.40)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  topTitle: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 3,
    marginBottom: SPACING.xl,
    textAlign: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.20)',
    fontSize: 10,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  topItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  topNumber: {
    color: 'rgba(255, 255, 255, 0.10)',
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    width: 36,
  },
  topInfo: {
    flex: 1,
  },
  topDocTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  topDocStats: {
    color: 'rgba(255, 255, 255, 0.30)',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 4,
    marginBottom: SPACING.sm,
  },
  barTrack: {
    height: 3,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
});

export default AdminStats;
