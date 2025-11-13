import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Modal,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { useState } from 'react';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<RootStackParamList, 'AddVehicle'>;

// ---- EV BRAND & MODEL OPTIONS (Top ~10 brands in PH) ----
export const EV_BRANDS = [
  { id: 'byd', name: 'BYD' },
  { id: 'nissan', name: 'Nissan' },
  { id: 'porsche', name: 'Porsche' },
  { id: 'jaguar', name: 'Jaguar' },
  { id: 'wm', name: 'WM Motor' },
  { id: 'jaecoo', name: 'JAECOO' },
  { id: 'vinfast', name: 'VinFast' },
  { id: 'jetour', name: 'Jetour' },
  { id: 'tesla', name: 'Tesla' },
  { id: 'mg', name: 'MG' },
] as const;

export const EV_MODELS: Record<(typeof EV_BRANDS)[number]['id'], string[]> = {
  byd: ['Seagull', 'Dolphin', 'Atto 3', 'Han', 'Tang', 'Seal'],
  nissan: ['Leaf'],
  porsche: ['Taycan'],
  jaguar: ['I-Pace'],
  wm: ['W5'],
  jaecoo: ['EJ6'],
  vinfast: ['VF 3', 'VF 5', 'VF 7', 'VF 9'],
  jetour: ['Ice Cream EV'],
  tesla: ['Model 3', 'Model Y'],
  mg: ['MG 4 EV'],
};

// ---- Plug types (unchanged) ----
const PLUG_TYPES = [
  { id: 'type1', label: 'TYPE 1', region: 'Japan', icon: 'ev-plug-type1' },
  { id: 'type2', label: 'TYPE 2', region: 'Europe', icon: 'ev-plug-type2' },
  { id: 'gbt', label: 'GB/T AC', region: 'China', icon: 'ev-plug-type2' },
  { id: 'chademo', label: 'CHADEMO', region: 'Japan', icon: 'ev-plug-chademo' },
  { id: 'ccs1', label: 'CCS 1', region: 'Europe', icon: 'ev-plug-ccs1' },
  { id: 'ccs2', label: 'CCS 2', region: 'Europe', icon: 'ev-plug-ccs2' },
];

type BrandId = (typeof EV_BRANDS)[number]['id'];

export default function AddVehicleScreen({ navigation }: Props) {
  const [licensePlate, setLicensePlate] = useState('');
  const [brand, setBrand] = useState('');
  const [brandId, setBrandId] = useState<BrandId | null>(null);
  const [model, setModel] = useState('');
  const [selectedPlug, setSelectedPlug] = useState<string | null>(null);

  const [brandModalVisible, setBrandModalVisible] = useState(false);
  const [modelModalVisible, setModelModalVisible] = useState(false);

  const handleSubmit = () => {
    navigation.navigate('MainTabs');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleConnectApi = () => {
    // placeholder
  };

  const openBrandModal = () => {
    setBrandModalVisible(true);
  };

  const openModelModal = () => {
    if (!brandId) return; // no brand selected yet
    setModelModalVisible(true);
  };

  const handleSelectBrand = (b: (typeof EV_BRANDS)[number]) => {
    setBrand(b.name);
    setBrandId(b.id);
    setModel(''); // reset model when brand changes
    setBrandModalVisible(false);
  };

  const handleSelectModel = (m: string) => {
    setModel(m);
    setModelModalVisible(false);
  };

  const modelsForBrand = brandId ? EV_MODELS[brandId] : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Add Vehicle</Text>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="chevron-back" size={26} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Scrollable content */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Connect API */}
            <TouchableOpacity style={styles.apiButton} onPress={handleConnectApi}>
              <Feather name="external-link" size={20} color="#041308" style={styles.apiIcon} />
              <Text style={styles.apiButtonText}>Connect API</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* License Plate */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>License Plate Number</Text>
              <TextInput
                style={styles.input}
                placeholder="ABC1234"
                placeholderTextColor="#6B6D74"
                value={licensePlate}
                onChangeText={setLicensePlate}
              />
            </View>

            {/* Brand */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Brand</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.dropdown}
                onPress={openBrandModal}
              >
                <Text style={[styles.dropdownText, !brand && { color: '#6B6D74' }]}>
                  {brand || 'Select Brand'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#A0A2AA" />
              </TouchableOpacity>
            </View>

            {/* Model */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Model</Text>
              <TouchableOpacity
                activeOpacity={brandId ? 0.8 : 1}
                style={[styles.dropdown, !brandId && { opacity: 0.5 }]}
                onPress={openModelModal}
              >
                <Text style={[styles.dropdownText, !model && { color: '#6B6D74' }]}>
                  {model || 'Select Model'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#A0A2AA" />
              </TouchableOpacity>
            </View>

            {/* Plug Type */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Plug Type</Text>

              <View style={styles.plugGrid}>
                {PLUG_TYPES.map(plug => {
                  const isSelected = selectedPlug === plug.id;
                  return (
                    <TouchableOpacity
                      key={plug.id}
                      style={[styles.plugCard, isSelected && styles.plugCardSelected]}
                      onPress={() => setSelectedPlug(plug.id)}
                      activeOpacity={0.85}
                    >
                      <MaterialCommunityIcons
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        name={plug.icon as any}
                        size={32}
                        color={isSelected ? '#0C1710' : '#D3D4DB'}
                      />
                      <Text style={[styles.plugLabel, isSelected && styles.plugLabelSelected]}>
                        {plug.label}
                      </Text>
                      <Text style={[styles.plugRegion, isSelected && styles.plugRegionSelected]}>
                        {plug.region}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.9}>
          <Text style={styles.submitText}>Submit</Text>
        </TouchableOpacity>

        {/* Brand Modal */}
        <Modal
          visible={brandModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setBrandModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Brand</Text>
              {EV_BRANDS.map(b => (
                <TouchableOpacity
                  key={b.id}
                  style={styles.modalItem}
                  onPress={() => handleSelectBrand(b)}
                >
                  <Text style={styles.modalItemText}>{b.name}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.modalItem, styles.modalCancel]}
                onPress={() => setBrandModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Model Modal */}
        <Modal
          visible={modelModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModelModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Select Model</Text>
              {modelsForBrand.map(m => (
                <TouchableOpacity
                  key={m}
                  style={styles.modalItem}
                  onPress={() => handleSelectModel(m)}
                >
                  <Text style={styles.modalItemText}>{m}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.modalItem, styles.modalCancel]}
                onPress={() => setModelModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const GREEN = '#78FF9F';
const DARK_BG = '#05060A';
const CARD_BG = '#151620';
const BORDER_DARK = '#262736';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  content: {
    flex: 1,
  },
  apiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GREEN,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    justifyContent: 'center',
    marginBottom: 16,
  },
  apiIcon: {
    marginRight: 10,
  },
  apiButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#041308',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER_DARK,
  },
  dividerText: {
    marginHorizontal: 12,
    color: '#7C7F88',
    fontSize: 14,
  },
  fieldGroup: {
    marginTop: 14,
  },
  label: {
    color: '#F1F2F6',
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: BORDER_DARK,
  },
  dropdown: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER_DARK,
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  plugGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
    justifyContent: 'space-between',
  },
  plugCard: {
    width: '30%',
    aspectRatio: 0.85,
    backgroundColor: CARD_BG,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER_DARK,
  },
  plugCardSelected: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  plugLabel: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '700',
    color: '#E1E2E8',
  },
  plugRegion: {
    marginTop: 2,
    fontSize: 11,
    color: '#9A9DA7',
  },
  plugLabelSelected: {
    color: '#0C1710',
  },
  plugRegionSelected: {
    color: '#0C1710',
  },
  submitButton: {
    backgroundColor: GREEN,
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#041308',
  },
  // --- modal styles ---
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: '#11121A',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  modalItem: {
    paddingVertical: 10,
  },
  modalItemText: {
    color: '#F1F2F6',
    fontSize: 16,
  },
  modalCancel: {
    marginTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BORDER_DARK,
  },
  modalCancelText: {
    color: '#7C7F88',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 6,
  },
});
