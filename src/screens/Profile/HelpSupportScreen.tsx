import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import BackArrow from '@/components/BackArrow';

export default function HelpSupportScreen() {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.safeArea} edges={['top','left','right','bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.paragraph}>
          This is a demo help page. For support, contact support@example.com or call 1234-567.
        </Text>

        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <BackArrow onPress={() => navigation.goBack()} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050816' },
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: '700', color: '#F9FAFB', marginBottom: 12 },
  paragraph: { color: '#9CA3AF', fontSize: 14, lineHeight: 20 },
  back: { marginTop: 20 },
  backText: { color: '#00F470', fontWeight: '700' },
});
