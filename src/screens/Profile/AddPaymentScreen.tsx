import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveForDevice } from '@/services/deviceStore';
import { useNavigation } from '@react-navigation/native';
import BackArrow from '@/components/BackArrow';

export default function AddPaymentScreen() {
  const navigation = useNavigation<any>();
  const [card, setCard] = useState('');
  const [name, setName] = useState('');

  const handleSave = async () => {
    if (!card || !name) return Alert.alert('Please fill card and name');
    const payment = { id: 'pm-' + Date.now(), card: `•••• ${card.slice(-4)}`, name };
    try {
      await saveForDevice('paymentMethods', [payment]);
      Alert.alert('Saved', 'Payment method saved locally for this device');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not save payment method');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top','left','right','bottom']}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.title}>Add Payment Method</Text>
          <BackArrow onPress={() => navigation.goBack()} />
        </View>
        <TextInput
          value={card}
          onChangeText={setCard}
          placeholder="Card number (enter numbers)"
          keyboardType="numeric"
          style={styles.input}
        />
        <TextInput value={name} onChangeText={setName} placeholder="Name" style={styles.input} />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050816' },
  container: { padding: 20 },
  title: { fontSize: 20, fontWeight: '700', color: '#F9FAFB', marginBottom: 12 },
  input: { backgroundColor: '#0B1020', padding: 12, borderRadius: 8, color: '#fff', marginBottom: 12 },
  saveBtn: { backgroundColor: '#00F470', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#02110A', fontWeight: '700' },
});
