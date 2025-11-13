import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

// Philippine regions (18)
const REGIONS = [
  'Region I – Ilocos',
  'Region II – Cagayan Valley',
  'Region III – Central Luzon',
  'Region IV-A – CALABARZON',
  'MIMAROPA',
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
  'NCR – National Capital':      { months: [400, 450, 550, 650, 620, 580],  label: 'NCR' },
  'Region IV-A – CALABARZON':    { months: [200, 220, 280, 330, 320, 290],  label: 'Region IV-A' },
  'Region III – Central Luzon':  { months: [160, 180, 220, 250, 240, 210],  label: 'Region III' },
  'Region XI – Davao':           { months: [100, 115, 130, 145, 155, 140],  label: 'Region XI' },
  'Region VII – Central Visayas':{ months: [90, 100, 115, 130, 140, 125],   label: 'Region VII' },
  'CAR – Cordillera':            { months: [90, 95, 110, 120, 115, 105],   label: 'CAR' },
  'Region X – Northern Mindanao':{ months: [60, 70, 80, 90, 95, 85],     label: 'Region X' },
  'Region VI – Western Visayas': { months: [55, 65, 75, 85, 80, 70],     label: 'Region VI' },
  'Region I – Ilocos':           { months: [45, 50, 60, 65, 60, 55],     label: 'Region I' },
  'NIR – Negros Island':         { months: [40, 45, 50, 55, 50, 45],     label: 'NIR' },
  'Region II – Cagayan Valley':  { months: [35, 40, 45, 50, 45, 40],     label: 'Region II' },
  'MIMAROPA':                    { months: [30, 35, 40, 50, 50, 45],     label: 'MIMAROPA' },
  'Region V – Bicol':            { months: [25, 30, 35, 40, 35, 30],     label: 'Region V' },
  'Region VIII – Eastern Visayas':{ months: [20, 25, 30, 35, 30, 25],     label: 'Region VIII' },
  'Region IX – Zamboanga':       { months: [15, 20, 25, 30, 25, 20],     label: 'Region IX' },
  'Region XII – SOCCSKSARGEN':   { months: [10, 15, 20, 25, 20, 15],     label: 'Region XII' },
  'Region XIII – Caraga':        { months: [10, 15, 20, 25, 20, 15],     label: 'Region XIII' },
  'BARMM – Bangsamoro':          { months: [5, 10, 15, 20, 15, 10],      label: 'BARMM' },
};

export default function AdminDashboard() {
  const [selectedRegion, setSelectedRegion] = useState(SELECT_OPTIONS[0]); // default to Overall
  const [selectedMonth, setSelectedMonth] = useState(MONTH_SELECT_OPTIONS[MONTH_SELECT_OPTIONS.length - 1]);

  const shortRegionLabel = (r: string) => {
    const parts = r.split('–').map((p) => p.trim());
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
        color: () => '#4CAF50',
      },
    ],
  };

  const monthIndex = MONTHS.indexOf(selectedMonth);
  const barValues = REGIONS.map((r) => {
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

  // NCR total baseline (always total across months) — used as 100%
  const ncrKey = REGIONS.find(r => r.startsWith('NCR')) ?? 'NCR – National Capital';
  const ncrMonths = CONSUMPTION_DATA[ncrKey]?.months ?? [];
  const ncrTotalBaseline = ncrMonths.length ? ncrMonths.reduce((s, v) => s + v, 0) : Math.max(...barValues, 1);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Electric Consumption Analytics</Text>

      {/* Region Selector Dropdown */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Select Region</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedRegion}
            onValueChange={(itemValue) => setSelectedRegion(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            mode="dropdown"
            dropdownIconColor="#ffffff"
          >
            {SELECT_OPTIONS.map((region) => (
              <Picker.Item
                key={region}
                label={region.split('–')[1]?.trim() || region}
                value={region}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Time Series Chart */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          Electric Consumption - {selectedRegion === 'All Regions – Overall' ? 'Overall' : CONSUMPTION_DATA[selectedRegion]?.label || selectedRegion} (kWh)
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <LineChart
            data={timeSeriesData}
            width={Math.max(screenWidth - 48, chartWidth)}
            height={240}
            chartConfig={{
              backgroundColor: '#2c3035',
              backgroundGradientFrom: '#2c3035',
              backgroundGradientTo: '#1f2321',
              color: (opacity = 1) => `rgba(70,249,140, ${opacity})`,
              strokeWidth: 2,
              useShadowColorFromDataset: false,
              decimalPlaces: 0,
              labelColor: (opacity = 1) => `rgba(255,255,255, ${opacity * 0.85})`,
            }}
            bezier
            style={styles.chart}
          />
        </ScrollView>
      </View>

      {/* Month Selector Dropdown */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Filter Bar Chart by Month</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            mode="dropdown"
            dropdownIconColor="#ffffff"
          >
            {MONTH_SELECT_OPTIONS.map((m) => (
              <Picker.Item key={m} label={m} value={m} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Bar Chart - All Regions (horizontal bars) */}
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <View style={{ width: chartWidth }}>
         

          {/* bars */}
          <View style={{ paddingVertical: 6 }}>
            {(() => {
              const labelWidth = 56;
              const valueWidth = 72;
              const baseAvailable = Math.max(80, chartWidth - labelWidth - valueWidth - 32);
              const available = Math.round(baseAvailable * 0.85);
              const minVisiblePx = 2;

              return REGIONS.map((r, i) => {
                const val = barValues[i] ?? 0;
                // ratio relative to NCR TOTAL baseline (not month-specific)
                const ratio = ncrTotalBaseline > 0 ? Math.min(val / ncrTotalBaseline, 1) : 0;
                const fillWidthRaw = Math.round(ratio * available);
                const fillWidth = val > 0 ? Math.max(fillWidthRaw, minVisiblePx) : 0;

                // position the absolute value label near end of fill (inside if possible)
                const overlayLeft = fillWidth > 48
                  ? Math.min(Math.max(fillWidth - 48, 6), available - 64)
                  : Math.min(fillWidth + 6, available - 64);

                return (
                  <View key={r} style={styles.barRow}>
                    <Text style={styles.barLabel}>{shortRegionLabel(r)}</Text>

                    <View style={[styles.barTrack, { width: available }]}>
                      <View style={[styles.barFill, { width: fillWidth }]} />
                      <Text
                        style={[
                          styles.barValueOverlay,
                          { left: overlayLeft },
                        ]}
                        numberOfLines={1}
                      >
                        {val.toLocaleString()}
                      </Text>
                    </View>

                    {/* numeric fallback / right-side value (subtle) */}
                    <Text style={styles.barValue}>{val.toLocaleString()}</Text>
                  </View>
                );
              });
            })()}
          </View>

          {/* lower axis (ticks & labels) */}
          <View style={styles.axisContainer}>
            <Text style={styles.axisLabel}>0</Text>
            <Text style={styles.axisLabel}>{Math.round(ncrTotalBaseline / 2).toLocaleString()}</Text>
            <Text style={styles.axisLabel}>{Math.round(ncrTotalBaseline).toLocaleString()}</Text>
          </View>
        </View>
      </ScrollView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111312', padding: 20 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 5, color: '#ffffff' },
  subtitle: { fontSize: 14, color: '#ffffff', marginBottom: 20 },
  sectionContainer: { marginBottom: 30, backgroundColor: '#1f2321', padding: 15, borderRadius: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#ffffff' },
  smallText: { fontSize: 12, color: '#ffffff', marginBottom: 8 },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ffffff22',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#111312',
    color: '#ffffff'
  },
  picker: {
    height: 60,
    backgroundColor: '#1f2321',
    paddingVertical: 6,
    color: '#ffffff',
  },
  pickerItem: { height: 60, fontSize: 16, color: '#ffffff' },
  chart: { marginVertical: 10, borderRadius: 8, backgroundColor: '#2c3035' },
  footer: { fontSize: 14, color: '#ffffff', marginTop: 20, marginBottom: 30, textAlign: 'center' },

  /* horizontal bar chart styles */
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  barLabel: {
    width: 56,
    color: '#ffffff',
    fontSize: 12,
    textAlign: 'left',
    marginRight: 8,
  },
  barTrack: {
    height: 18,
    backgroundColor: '#222428',
    borderRadius: 9,
    overflow: 'hidden',
    marginRight: 8,
    position: 'relative',
  },
  barFill: {
    height: 18,
    backgroundColor: '#46f98c',
    borderRadius: 9,
  },
  barValue: {
    width: 72,
    textAlign: 'right',
    color: '#ffffff',
    fontSize: 12,
  },
  /* overlay label shown near end of bar fill (absolute value) */
  barValueOverlay: {
    position: 'absolute',
    top: -2,
    color: '#111312',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'transparent',
    display:'none'
  },
  axisContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    marginTop: 6,
  },
  axisLabel: {
    color: '#B0B0B0',
    fontSize: 11,
  },
});