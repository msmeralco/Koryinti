import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
// ...existing code...

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
  // helper: produce short x-axis label (roman or acronym)
  const shortRegionLabel = (r: string) => {
    const parts = r.split('–').map((p) => p.trim());
    const left = parts[0]; // e.g. "Region I" or "NCR" or "MIMAROPA"
    if (/^Region\b/i.test(left)) {
      return left.replace(/^Region\s*/i, '').trim(); // "I", "II", "IV-A", "XII", etc.
    }
    return left; // "NCR", "CAR", "MIMAROPA", "BARMM", "NIR", or "All Regions"
  };

  // returns months array for a region or aggregated across all regions
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

  // Time series data for selected region (or overall)
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

  // Bar chart: data depends on selectedMonth. If 'Total' -> sum over months per region,
  // otherwise use the month index.
  const monthIndex = MONTHS.indexOf(selectedMonth);
  const barValues = REGIONS.map((r) => {
    const months = CONSUMPTION_DATA[r]?.months ?? [];
    if (selectedMonth === 'Total') {
      return months.reduce((s, v) => s + (v ?? 0), 0);
    }
    return months[monthIndex] ?? 0;
  });

  const barChartData = {
    labels: REGIONS.map((r) => shortRegionLabel(r)),
    datasets: [{ data: barValues }],
  };

  // Grand total (sum of barValues) for display
  const grandTotal = barValues.reduce((s, v) => s + v, 0);

  // compute chart width so bars have breathing room: allocate ~60px per region
  const perBarWidth = 60;
  const chartWidth = Math.max(screenWidth - 40, REGIONS.length * perBarWidth);

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
    Electric Consumption - {selectedRegion === 'All Regions – Overall' ? 'Overall' : CONSUMPTION_DATA[selectedRegion].label} (kWh)
  </Text>
  <ScrollView horizontal showsHorizontalScrollIndicator>
    <LineChart
      data={timeSeriesData}
      width={screenWidth - 48} // Adjust width as needed
      height={240}
      chartConfig={{
        backgroundColor: '#fff',
        backgroundGradientFrom: '#fff',
        backgroundGradientTo: '#fff',
        color: (opacity = 1) => `rgba(76,175,80, ${opacity})`,
        strokeWidth: 2,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
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

      {/* Bar Chart - All Regions June */}
      <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>
          {selectedMonth === 'Total' ? 'Total Consumption by Region (sum of months) (kWh)' : `${selectedMonth} Consumption by Region (kWh)`}
        </Text>
        <Text style={styles.smallText}>Grand total: {grandTotal.toLocaleString()} kWh</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <BarChart
            data={barChartData}
            width={chartWidth}
            height={280}
            yAxisLabel=""
            yAxisSuffix=" kWh"
            fromZero
            showValuesOnTopOfBars
            verticalLabelRotation={0}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(33,150,243, ${opacity})`,
              strokeWidth: 2,
              useShadowColorFromDataset: false,
              decimalPlaces: 0,
            }}
            style={styles.chart}
          />
        </ScrollView>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111312', padding: 20 },            // natural.land
  title: { fontSize: 26, fontWeight: '700', marginBottom: 5, color: '#ffffff' }, // strokeColor
  subtitle: { fontSize: 14, color: '#ffffff', marginBottom: 20 },               // strokeColor
  sectionContainer: { marginBottom: 30, backgroundColor: '#1f2321', padding: 15, borderRadius: 8 }, // infrastructure.urbanArea
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#ffffff' }, // strokeColor
  smallText: { fontSize: 12, color: '#ffffff', marginBottom: 8 },               // strokeColor
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ffffff22',
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#111312',      
    color: '#ffffff'                                           // infrastructure.urbanArea
  },
  picker: {
    height: 60,
    backgroundColor: '#1f2321',                                                 // infrastructure.urbanArea
    paddingVertical: 6,
    color: '#ffffff',                                                          // strokeColor
  },
  pickerItem: { height: 60, fontSize: 16, color: '#ffffff' },                   // strokeColor
  chart: { marginVertical: 10, borderRadius: 8, backgroundColor: '#2c3035' },    // natural.water
  footer: { fontSize: 14, color: '#ffffff', marginTop: 20, marginBottom: 30, textAlign: 'center' }, // strokeColor
});
// ...existing code...