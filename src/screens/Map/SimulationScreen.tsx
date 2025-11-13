import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import mapDarkStyle from './mapDarkStyle.json';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MapStackParamList } from '@/types/navigation';
import { CITIES } from '@/services/simRoads';

type Props = { navigation: any };

// no individual cars now; we show one demand icon per city

const INITIAL_REGION = {
  latitude: 14.5995,
  longitude: 120.9842,
  latitudeDelta: 6.5, // zoomed out to show PH
  longitudeDelta: 6.5,
};

export default function SimulationScreen({ navigation }: Props) {
  const [running, setRunning] = useState(false);
  const [simHour, setSimHour] = useState(0); // 0..23
  const [simDay, setSimDay] = useState(1); // 1..30 per month
  const [month, setMonth] = useState(1); // 1..4
  const tickRef = useRef<NodeJS.Timer | null>(null);
  const simHourRef = useRef(0);
  const monthRef = useRef(1);
  const dayRef = useRef(1);
  const cityDemandRef = useRef<Record<string, number>>({});
  const [cityDemand, setCityDemand] = useState<Record<string, number>>({});
  const cityWeightRef = useRef<Record<string, number>>({});
  const [demandByHour, setDemandByHour] = useState<number[]>(Array.from({ length: 24 }, () => 0));
  const baselineRef = useRef<number[]>(Array.from({ length: 24 }, () => 0));

  useEffect(() => { simHourRef.current = simHour; }, [simHour]);
  useEffect(() => { monthRef.current = month; }, [month]);

  // Build a realistic baseline demand curve using a mixture of smooth peaks
  useEffect(() => {
    const hours = [...Array(24).keys()];
    const gauss = (h: number, mu: number, sigma: number, amp: number) => amp * Math.exp(-0.5 * Math.pow((h - mu) / sigma, 2));
    const curve = hours.map(h => {
      // Typical patterns: small midday workplace peak, strong evening home-charging peak, low overnight
      const midday = gauss(h, 13, 2.2, 35);  // around 1 PM
      const evening = gauss(h, 20, 2.8, 85); // around 8 PM
      const late = gauss(h, 23, 2.5, 25);    // some late-night top-ups
      const floor = 8; // base load
      return Math.round(floor + midday + evening + late);
    });
    baselineRef.current = curve;
    setDemandByHour(curve);
  }, []);

  const start = () => {
    if (running) return;
    setSimHour(0); simHourRef.current = 0;
    setSimDay(1); dayRef.current = 1;
    setMonth(1); monthRef.current = 1;
    // initialize per-city weights (population/EV share proxy)
    const weights: Record<string, number> = {};
    CITIES.forEach(c => { weights[c.id] = 0.8 + Math.random() * 0.8; });
    cityWeightRef.current = weights;
    setCityDemand({});
    setRunning(true);

    // Hour tick: 1 simulated hour per 100ms
    // 1 simulated hour every 0.01s
    tickRef.current = setInterval(() => {
      setSimHour(prev => {
        let next = prev + 1;
        if (next >= 24) {
          // advance day after 24h
          setSimDay(d => {
            let nd = d + 1;
            dayRef.current = nd;
            if (nd > 30) {
              nd = 1;
              // then advance month (max 4)
              setMonth(m => {
                const nm = m + 1;
                if (nm > 4) {
                  stop();
                  return m;
                }
                monthRef.current = nm;
                return nm;
              });
            }
            return nd;
          });
          next = 0;
        }
        // update demand curve with strong after-work peak and global movement on all bars
        setDemandByHour(() => {
          const base = baselineRef.current;
          const monthFactor = 1 + (monthRef.current - 1) * 0.18; // mild growth
          const influence = Math.min(1, (monthRef.current - 1) / 3); // 0..1 across months
          // emphasize after-work (17-22) while smoothing into shoulders; add small live ripple across all bars
          const hours = 24;
          const ripplePhase = (simHourRef.current / 24) * Math.PI * 2;
          const K = [0.06, 0.22, 0.44, 0.22, 0.06];
          const boosted = base.map((v, h) => {
            const afterWorkBoost = h >= 17 && h <= 22 ? 1.15 : 1.0;
            const drift = 1 + 0.03 * Math.sin(ripplePhase + h * 0.5);
            return v * monthFactor * afterWorkBoost * drift;
          });
          const smooth: number[] = new Array(hours).fill(0);
          for (let h = 0; h < hours; h++) {
            let acc = 0;
            for (let k = -2; k <= 2; k++) {
              const hh = Math.min(23, Math.max(0, h + k));
              acc += boosted[hh] * K[k + 2];
            }
            // blend original and smoothed to show app-induced flattening
            smooth[h] = (1 - influence) * boosted[h] + influence * acc;
          }
          return smooth.map(v => Math.min(160, Math.round(v)));
        });

        // per-city demand for current hour (for city markers)
        const hour = simHourRef.current;
        const curveNow = baselineRef.current[hour];
        const influence = Math.min(1, (monthRef.current - 1) / 3);
        const ripplePhase = (simHourRef.current / 24) * Math.PI * 2;
        const cityMap: Record<string, number> = {};
        CITIES.forEach(c => {
          const w = cityWeightRef.current[c.id] || 1;
          // add small city-specific ripple so icons change continuously
          const ripple = 1 + 0.08 * Math.sin(ripplePhase + (c.bounds.minLat + c.bounds.maxLat) * 0.7);
          cityMap[c.id] = Math.max(0, curveNow * w * ripple * (1 + 0.1 * influence));
        });
        cityDemandRef.current = cityMap;
        setCityDemand(cityMap);
        return next;
      });
    }, 10);
  };

  const stop = () => {
    if (tickRef.current) { clearInterval(tickRef.current as any); tickRef.current = null; }
    setRunning(false);
  };

  useEffect(() => () => stop(), []);

  const cityCenter = (cityId: string) => {
    const c = CITIES.find(x => x.id === cityId)!;
    return {
      latitude: (c.bounds.minLat + c.bounds.maxLat) / 2,
      longitude: (c.bounds.minLng + c.bounds.maxLng) / 2,
    };
  };

  const demandToColor = (v: number) => {
    // Map from blue (low) to yellow (high): hue 210 -> 55
    const clamped = Math.max(0, Math.min(100, v / 1.6)); // normalize roughly to 0..100
    const hue = 210 - (155 * clamped) / 100;
    return `hsl(${hue}, 85%, 55%)`;
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top','left','right']}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        provider={PROVIDER_GOOGLE}
        googleMapId="508c49184e5a4073b3a02f38"
        customMapStyle={mapDarkStyle as any}
        showsUserLocation
      >
        {CITIES.map(city => (
          <Marker key={city.id} coordinate={cityCenter(city.id)}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons
                name="flash"
                size={22}
                color={demandToColor((cityDemand[city.id] || 0))}
              />
            </View>
          </Marker>
        ))}
      </MapView>
      {running && (
        <View style={styles.timerPill}>
          <Text style={styles.timerText}>Month {month}/4 • Day {simDay} • Hour {simHour}</Text>
        </View>
      )}
      <View style={styles.bottomPanel}>
        <View style={styles.controlsRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={running ? stop : start} style={styles.runBtn}>
            <Text style={styles.runBtnText}>{running ? 'Stop' : 'Start'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chart}>
          <Text style={styles.chartTitle}>EV demand by hour</Text>
          <View style={styles.barsRow}>
            {demandByHour.map((v, h) => {
              const height = Math.max(4, Math.min(100, v));
              return (
                <View
                  key={h}
                  style={{ width: 8, height, backgroundColor: demandToColor(v), borderRadius: 3 }}
                />
              );
            })}
          </View>
          <View style={styles.axisRow}>
            <Text style={styles.axisLabel}>0</Text>
            <Text style={styles.axisLabel}>6</Text>
            <Text style={styles.axisLabel}>12</Text>
            <Text style={styles.axisLabel}>18</Text>
            <Text style={styles.axisLabel}>23</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0b1220' },
  timerPill: {
    position: 'absolute', top: 16, alignSelf: 'center',
    backgroundColor: '#101826', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 999,
  },
  timerText: { color: '#E6EDF3', fontWeight: '600' },
  bottomPanel: {
    position: 'absolute', left: 12, right: 12, bottom: 12,
    backgroundColor: '#0b1220ee', borderRadius: 12, padding: 12,
  },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backBtn: { backgroundColor: '#1f2a44', padding: 10, borderRadius: 8 },
  runBtn: { backgroundColor: '#2a9358', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  runBtnText: { color: '#fff', fontWeight: '700' },
  chart: { backgroundColor: '#0b1220', borderRadius: 12, padding: 12 },
  chartTitle: { color: '#C6CFD7', fontWeight: '700', marginBottom: 8 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 100 },
  axisRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  axisLabel: { color: '#677079', fontSize: 11 },
});