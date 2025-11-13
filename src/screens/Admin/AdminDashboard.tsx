import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const ACCENT_GREEN = '#00F470';

// Philippine regions (18)
const REGIONS = [
  'Region I – Ilocos',
  'Region II – Cagayan Valley',
  'Region III – Central Luzon',
  'Region IV-A – CALABARZON',
  'Region IV-B – MIMAROPA',
  'Region V – Bicol',
  'Region VI – Western Visayas',
  'Region VII – Central Visayas',
  'Region VIII – Eastern Visayas',
  'Region IX – Zamboanga',
  'Region X – Northern Mindanao',
  'Region XI – Davao',
  'Region XII – SOCCSKSARGEN',
  'Region XIII – Caraga',
  'NCR – National Capital',
  'CAR – Cordillera',
  'BARMM – Bangsamoro',
  'NIR – Negros Island',
];

// Picker options: include an overall aggregate option first
const SELECT_OPTIONS = ['All Regions – Overall', ...REGIONS];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
const MONTH_SELECT_OPTIONS = [...MONTHS, 'Total'];

// Sample consumption data per region (kWh)
const CONSUMPTION_DATA: Record<string, { months: number[]; label: string }> = {
  'NCR – National Capital': { months: [400, 450, 550, 650, 620, 580], label: 'NCR' },
  'Region IV-A – CALABARZON': { months: [200, 220, 280, 330, 320, 290], label: 'Region IV-A' },
  'Region III – Central Luzon': { months: [160, 180, 220, 250, 240, 210], label: 'Region III' },
  'Region XI – Davao': { months: [100, 115, 130, 145, 155, 140], label: 'Region XI' },
  'Region VII – Central Visayas': { months: [90, 100, 115, 130, 140, 125], label: 'Region VII' },
  'CAR – Cordillera': { months: [90, 95, 110, 120, 115, 105], label: 'CAR' },
  'Region X – Northern Mindanao': { months: [60, 70, 80, 90, 95, 85], label: 'Region X' },
  'Region VI – Western Visayas': { months: [55, 65, 75, 85, 80, 70], label: 'Region VI' },
  'Region I – Ilocos': { months: [45, 50, 60, 65, 60, 55], label: 'Region I' },
  'NIR – Negros Island': { months: [40, 45, 50, 55, 50, 45], label: 'NIR' },
  'Region II – Cagayan Valley': { months: [35, 40, 45, 50, 45, 40], label: 'Region II' },
  'Region IV-B – MIMAROPA': { months: [30, 35, 40, 50, 50, 45], label: 'Region IV-B' },
  'Region V – Bicol': { months: [25, 30, 35, 40, 35, 30], label: 'Region V' },
  'Region VIII – Eastern Visayas': { months: [20, 25, 30, 35, 30, 25], label: 'Region VIII' },
  'Region IX – Zamboanga': { months: [15, 20, 25, 30, 25, 20], label: 'Region IX' },
  'Region XII – SOCCSKSARGEN': { months: [10, 15, 20, 25, 20, 15], label: 'Region XII' },
  'Region XIII – Caraga': { months: [10, 15, 20, 25, 20, 15], label: 'Region XIII' },
  'BARMM – Bangsamoro': { months: [5, 10, 15, 20, 15, 10], label: 'BARMM' },
};

export default function AdminDashboard() {
  const navigation = useNavigation();
  const [selectedRegion, setSelectedRegion] = useState(SELECT_OPTIONS[0]); // default to Overall
  const [selectedMonth, setSelectedMonth] = useState(
    MONTH_SELECT_OPTIONS[MONTH_SELECT_OPTIONS.length - 1]
  );
  const [sortDescending, setSortDescending] = useState(false);

  const shortRegionLabel = (r: string) => {
    const parts = r.split('–').map(p => p.trim());
    const left = parts[0];
    if (/^Region\b/i.test(left)) {
      return left.replace(/^Region\s*/i, '').trim();
    }
    return left;
  };

  const getRegionMonths = (region: string) => {
    if (region === 'All Regions – Overall') {
      const values = Object.values(CONSUMPTION_DATA);
      if (values.length === 0) return [];
      const monthsCount = values[0].months.length;
      return Array.from({ length: monthsCount }, (_, i) =>
        values.reduce((sum, v) => sum + (v.months[i] ?? 0), 0)
      );
    }
    return CONSUMPTION_DATA[region]?.months ?? [];
  };

  const currentRegionMonths = getRegionMonths(selectedRegion);
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const timeSeriesData = {
    labels: monthLabels,
    datasets: [
      {
        data: currentRegionMonths,
        strokeWidth: 2,
        color: () => ACCENT_GREEN,
      },
    ],
  };

  const monthIndex = MONTHS.indexOf(selectedMonth);
  const barValues = REGIONS.map(r => {
    const months = CONSUMPTION_DATA[r]?.months ?? [];
    if (selectedMonth === 'Total') {
      return months.reduce((s, v) => s + (v ?? 0), 0);
    }
    return months[monthIndex] ?? 0;
  });

  const grandTotal = barValues.reduce((s, v) => s + v, 0);

  // per-bar allocation and chart width capped to screen width (100% of screen)
  const perBarWidth = 60;
  const chartWidth = Math.min(REGIONS.length * perBarWidth, screenWidth - 40);

  // Max of current selection: highest bar is full pill, others scale
  const maxValueForSelection = Math.max(...barValues, 1);

  // displayed order (original or sorted by current barValues desc)
  const displayedRegions = useMemo(() => {
    if (!sortDescending) return REGIONS;
    const pairs = REGIONS.map((r, idx) => ({ region: r, value: barValues[idx] ?? 0 }));
    pairs.sort((a, b) => b.value - a.value);
    return pairs.map(p => p.region);
  }, [barValues, sortDescending]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View>
              <Text style={styles.title}>Admin Dashboard</Text>
              <Text style={styles.subtitle}>Electric Consumption Analytics</Text>
            </View>
          </View>
          <View style={styles.titleIconWrapper}>
            <MaterialCommunityIcons name="chart-box-outline" size={24} color={ACCENT_GREEN} />
          </View>
        </View>

        {/* Region Selector */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Select region</Text>
            <View style={styles.sectionPill}>
              <Ionicons name="flash-outline" size={12} color={ACCENT_GREEN} />
              <Text style={styles.sectionPillText}>
                Total: {grandTotal.toLocaleString()} kWh
              </Text>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorRow}
          >
            {SELECT_OPTIONS.map(option => {
              const isActive = selectedRegion === option;
              const label =
                option === 'All Regions – Overall' ? 'All regions' : shortRegionLabel(option);
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => setSelectedRegion(option)}
                  style={[styles.chip, isActive && styles.chipActive]}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Series Chart */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              Consumption –{' '}
              {selectedRegion === 'All Regions – Overall'
                ? 'All regions'
                : CONSUMPTION_DATA[selectedRegion]?.label || selectedRegion}{' '}
              (kWh)
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={timeSeriesData}
              width={Math.max(screenWidth - 48, chartWidth)}
              height={240}
              chartConfig={{
                backgroundColor: '#050816',
                backgroundGradientFrom: '#050816',
                backgroundGradientTo: '#050816',
                color: (opacity = 1) => `rgba(0,244,112, ${opacity})`,
                strokeWidth: 2,
                useShadowColorFromDataset: false,
                decimalPlaces: 0,
                labelColor: (opacity = 1) => `rgba(229,231,235, ${opacity})`,
                propsForDots: {
                  r: '4',
                },
              }}
              bezier
              style={styles.chart}
            />
          </ScrollView>
        </View>

        {/* Month Selector */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Filter bar chart by month</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorRow}
          >
            {MONTH_SELECT_OPTIONS.map(m => {
              const isActive = selectedMonth === m;
              return (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSelectedMonth(m)}
                  style={[styles.chip, isActive && styles.chipActive]}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{m}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Sort button */}
          <View style={{ marginTop: 12, alignItems: 'flex-end' }}>
            <TouchableOpacity
              onPress={() => setSortDescending(s => !s)}
              style={[styles.sortButton, sortDescending && styles.sortButtonActive]}
            >
              <Ionicons
                name={sortDescending ? 'swap-vertical' : 'arrow-down-outline'}
                size={14}
                color={ACCENT_GREEN}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.sortButtonText}>
                {sortDescending ? 'Sorted: High → Low' : 'Sort High → Low'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal Bar Chart - All Regions */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ width: chartWidth }}>
            {/* Region / Consumption header */}
            <View style={styles.barHeaderRow}>
              <Text style={styles.barHeaderLabel}>Region</Text>
              <Text style={styles.barHeaderLabel}>Consumption</Text>
            </View>

            {/* bars */}
            <View style={{ paddingVertical: 6 }}>
              {(() => {
                const labelWidth = 72;
                const valueWidth = 72;
                const baseAvailable = Math.max(80, chartWidth - labelWidth - valueWidth - 32);
                const available = Math.round(baseAvailable * 0.85);
                const minVisiblePx = 2;

                return displayedRegions.map(r => {
                  const idx = REGIONS.indexOf(r);
                  const val = barValues[idx] ?? 0;
                  const ratio =
                    maxValueForSelection > 0 ? Math.min(val / maxValueForSelection, 1) : 0;
                  const fillWidthRaw = Math.round(ratio * available);
                  const fillWidth = val > 0 ? Math.max(fillWidthRaw, minVisiblePx) : 0;

                  return (
                    <View key={r} style={styles.barRow}>
                      <Text style={styles.barLabel} numberOfLines={1} ellipsizeMode="clip">
                        {shortRegionLabel(r)}
                      </Text>

                      <View style={[styles.barTrack, { width: available }]}>
                        <View style={[styles.barFill, { width: fillWidth }]} />
                      </View>

                      {/* Right-side consumption value */}
                      <Text style={styles.barValue}>{val.toLocaleString()}</Text>
                    </View>
                  );
                });
              })()}
            </View>
          </View>
        </ScrollView>

        <Text style={styles.footer}>
          Bars scale relative to the highest region for the selected month or total (full pill).
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050816',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12, // extra padding to clear Dynamic Island + spacing for sections
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#050816',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  titleIconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,244,112,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,244,112,0.06)',
  },

  sectionContainer: {
    marginBottom: 20,
    backgroundColor: '#0B1020',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  sectionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,244,112,0.08)',
  },
  sectionPillText: {
    fontSize: 11,
    color: ACCENT_GREEN,
    marginLeft: 4,
    fontWeight: '600',
  },

  selectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,1)',
    backgroundColor: '#050816',
    marginRight: 8,
  },
  chipActive: {
    borderColor: ACCENT_GREEN,
    backgroundColor: 'rgba(0,244,112,0.08)',
  },
  chipText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  chipTextActive: {
    color: ACCENT_GREEN,
    fontWeight: '600',
  },

  chart: {
    marginVertical: 10,
    borderRadius: 16,
  },

  footer: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },

  /* sort button */
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#050816',
    borderWidth: 1,
    borderColor: 'rgba(31,41,55,1)',
  },
  sortButtonActive: {
    backgroundColor: 'rgba(0,244,112,0.08)',
    borderColor: ACCENT_GREEN,
  },
  sortButtonText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },

  /* horizontal bar chart styles */
  barHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginBottom: 4,
  },
  barHeaderLabel: {
    fontSize: 11,
    color: '#6B7280',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  barLabel: {
    width: 72,
    color: '#E5E7EB',
    fontSize: 11,
    textAlign: 'left',
    marginRight: 8,
  },
  barTrack: {
    height: 18,
    backgroundColor: '#111827',
    borderRadius: 999,
    overflow: 'hidden',
    marginRight: 8,
    position: 'relative',
  },
  barFill: {
    height: 18,
    backgroundColor: ACCENT_GREEN,
    borderRadius: 999,
  },
  barValue: {
    width: 72,
    textAlign: 'right',
    color: '#9CA3AF',
    fontSize: 11,
  },
});
