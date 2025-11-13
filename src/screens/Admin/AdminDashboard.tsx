// ...existing code...
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

// Philippine regions
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

// Sample consumption data per region (kWh)
const CONSUMPTION_DATA: Record<string, { months: number[]; label: string }> = {
  'Region I – Ilocos': { months: [120, 145, 160, 175, 190, 210], label: 'Region I' },
  'Region II – Cagayan Valley': { months: [110, 130, 150, 165, 180, 200], label: 'Region II' },
  'Region III – Central Luzon': { months: [100, 125, 140, 155, 170, 190], label: 'Region III' },
  'Region IV-A – CALABARZON': { months: [95, 115, 135, 150, 165, 185], label: 'Region IV-A' },
  'MIMAROPA': { months: [130, 155, 175, 190, 210, 235], label: 'MIMAROPA' }, // fixed key
  'Region V – Bicol': { months: [140, 165, 185, 205, 225, 250], label: 'Region V' },
  'Region VI – Western Visayas': { months: [105, 125, 145, 160, 175, 195], label: 'Region VI' },
  'Region VII – Central Visayas': { months: [115, 135, 155, 170, 185, 205], label: 'Region VII' },
  'Region VIII – Eastern Visayas': { months: [150, 175, 200, 220, 240, 265], label: 'Region VIII' },
  'Region IX – Zamboanga': { months: [160, 185, 210, 235, 255, 280], label: 'Region IX' },
  'Region X – Northern Mindanao': { months: [125, 150, 170, 190, 210, 235], label: 'Region X' },
  'Region XI – Davao': { months: [135, 160, 180, 200, 220, 245], label: 'Region XI' },
  'Region XII – SOCCSKSARGEN': { months: [90, 110, 130, 145, 160, 180], label: 'Region XII' },
  'Region XIII – Caraga': { months: [85, 105, 125, 140, 155, 175], label: 'Region XIII' },
  'NCR – National Capital': { months: [75, 95, 115, 130, 145, 165], label: 'NCR' },
  'CAR – Cordillera': { months: [110, 135, 155, 175, 195, 220], label: 'CAR' },
  'BARMM – Bangsamoro': { months: [100, 120, 140, 155, 170, 190], label: 'BARMM' },
  'NIR – Negros Island': { months: [70, 90, 110, 125, 140, 160], label: 'NIR' },
};

export default function AdminDashboard() {
  const [selectedRegion, setSelectedRegion] = useState('Region I – Ilocos');

  const currentRegionData = CONSUMPTION_DATA[selectedRegion];
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  // Time series data for selected region
  const timeSeriesData = {
    labels: monthLabels,
    datasets: [
      {
        data: currentRegionData.months,
        strokeWidth: 2,
        color: () => '#4CAF50',
      },
    ],
  };

  // Bar chart: all 18 regions consumption for June (defensive access)
  const barChartData = {
    labels: REGIONS.map((r) => {
      const head = r.split('–')[0]?.trim() || r;
      return head.length > 10 ? head.substring(0, 10) : head;
    }),
    datasets: [
      {
        data: REGIONS.map((r) => CONSUMPTION_DATA[r]?.months?.[5] ?? 0),
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Electric Consumption Analytics</Text>

      {/* Region Selector */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Select Region ({REGIONS.length} total)</Text>
        <FlatList
          data={REGIONS}
          keyExtractor={(item) => item}
          numColumns={2}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.regionButton,
                selectedRegion === item && styles.regionButtonActive,
              ]}
              onPress={() => setSelectedRegion(item)}
            >
              <Text
                style={[
                  styles.regionButtonText,
                  selectedRegion === item && styles.regionButtonTextActive,
                ]}
              >
                {item.split('–')[1]?.trim() || item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Time Series Chart */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>
          Electric Consumption - {CONSUMPTION_DATA[selectedRegion].label} (kWh)
        </Text>
        <LineChart
          data={timeSeriesData}
          width={screenWidth - 40}
          height={250}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            color: () => '#4CAF50',
            strokeWidth: 2,
            useShadowColorFromDataset: false,
            decimalPlaces: 0,
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Bar Chart - All Regions June */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>June Consumption by Region (kWh)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator>
          <BarChart
            data={barChartData}
            width={screenWidth * 1.5}
            height={250}
            yAxisLabel=""              // added
            yAxisSuffix=" kWh"         // added
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: () => '#2196F3',
              strokeWidth: 2,
              useShadowColorFromDataset: false,
              decimalPlaces: 0,
            }}
            style={styles.chart}
          />
        </ScrollView>
      </View>

      <Text style={styles.footer}>Git Gud.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 26, fontWeight: '700', marginBottom: 5, color: '#333' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  sectionContainer: { marginBottom: 30, backgroundColor: '#fff', padding: 15, borderRadius: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 15, color: '#333' },
  chart: { marginVertical: 10, borderRadius: 8 },
  regionButton: {
    flex: 1,
    margin: 6,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  regionButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E7D32',
  },
  regionButtonText: { fontSize: 11, fontWeight: '600', color: '#333', textAlign: 'center' },
  regionButtonTextActive: { color: '#fff' },
  footer: { fontSize: 14, color: '#999', marginTop: 20, marginBottom: 30, textAlign: 'center' },
});
// ...existing code...