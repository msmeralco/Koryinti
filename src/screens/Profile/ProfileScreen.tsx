import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

/**
 * ProfileScreen displays user information and app settings.
 * For MVP, this shows placeholder information without full user management.
 */
export default function ProfileScreen() {
  const navigation = useNavigation<any>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
        </View>

        {/* VEHICLES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Vehicles</Text>
          <View style={styles.vehicleCard}>
            <View>
              <Text style={styles.vehicleName}>Tesla Model 3</Text>
              <Text style={styles.vehicleDetails}>2023 • Long Range</Text>
            </View>
            <View style={styles.defaultBadgePill}>
              <Text style={styles.defaultBadgeText}>Primary</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Vehicle</Text>
          </TouchableOpacity>
        </View>

        {/* PAYMENT METHODS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <View style={styles.paymentCard}>
            <Text style={styles.paymentText}>💳 •••• 4242</Text>
            <View style={styles.defaultBadgePill}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* SETTINGS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Privacy</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Help & Support</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
          
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const GREEN = '#00F470';

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617', // match main background so notch area is consistent
  },
  container: {
    flex: 1,
    backgroundColor: '#020617', // deep dark to match app
  },
  contentContainer: {
    paddingTop: 12,   // similar top spacing as AdminDashboard content
    paddingBottom: 32,
  },
  header: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#050816',
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  section: {
    backgroundColor: '#050816',
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#111827',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E5E7EB',
    marginBottom: 12,
  },
  vehicleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#020617',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#111827',
  },
  vehicleName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: 4,
  },
  vehicleDetails: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#020617',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#111827',
  },
  paymentText: {
    fontSize: 15,
    color: '#F9FAFB',
  },
  defaultBadgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 244, 112, 0.12)',
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: GREEN,
  },
  addButton: {
    paddingTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: GREEN,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#111827',
  },
  menuText: {
    fontSize: 15,
    color: '#E5E7EB',
  },
  menuArrow: {
    fontSize: 20,
    color: '#4B5563',
  },
  logoutButton: {
    marginTop: 24,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#F97373',
    backgroundColor: '#111827',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F97373',
    textAlign: 'center',
  },
});
