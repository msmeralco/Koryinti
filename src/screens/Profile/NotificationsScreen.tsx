import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackArrow from '@/components/BackArrow';
import { useNavigation } from '@react-navigation/native';

const DUMMY = [
  { id: '1', title: 'Reservation confirmed', body: 'Your reservation at Sta. Rosa is confirmed.' },
  { id: '2', title: 'Charger offline', body: 'A charger in Pasig is currently offline.' },
  { id: '3', title: 'Promo', body: 'Get 10% off at partner stations this week.' },
];

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.safeArea} edges={['top','left','right','bottom']}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Notifications</Text>
          <BackArrow onPress={() => navigation.goBack()} />
        </View>

        <FlatList
          data={DUMMY}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemBody}>{item.body}</Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050816' },
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#F9FAFB' },
  item: { padding: 12, borderRadius: 12, backgroundColor: '#07101a', marginBottom: 10, borderWidth: 1, borderColor: '#111827' },
  itemTitle: { color: '#E5E7EB', fontWeight: '700', marginBottom: 4 },
  itemBody: { color: '#9CA3AF' },
});
