import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabsParamList } from '@/types/navigation';

import MapNavigator from './MapNavigator';
import ProfileScreen from '@/screens/Profile/ProfileScreen';
import ReservationsScreen from '@/screens/Reservations/ReservationsScreen';

import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator<MainTabsParamList>();
/**
 * MainTabsNavigator provides the primary bottom tab navigation
 * for the main sections of the app after user registration/login
 */

const TAB_BAR_BG = '#050608';
const ACTIVE_PILL = '#4CAF50';
const ACTIVE_TEXT = '#FFFFFF';
const INACTIVE_ICON = 'rgba(255,255,255,0.8)';

function TabItem({
  focused,
  label,
  IconComponent,
  iconName,
}: {
  focused: boolean;
  label: string;
  IconComponent: any;
  iconName: string;
}) {
  if (focused) {
    return (
      <View style={styles.tabWrapper}>
        <View style={styles.pill}>
          <IconComponent name={iconName} size={22} color={ACTIVE_TEXT} />
          <Text style={styles.pillLabel}>{label}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.tabWrapper}>
      <View style={styles.iconOnly}>
        <IconComponent name={iconName} size={22} color={INACTIVE_ICON} />
      </View>
    </View>
  );
}

export default function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {/* HOME (MapNavigator) */}
      <Tab.Screen
        name="Map"
        component={MapNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem
              focused={focused}
              label="Home"
              IconComponent={Ionicons}
              iconName="home-outline"
            />
          ),
        }}
      />

      {/* SESSIONS (ReservationsScreen) */}
      <Tab.Screen
        name="Reservations"
        component={ReservationsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem
              focused={focused}
              label="Sessions"
              IconComponent={MaterialCommunityIcons}
              iconName="clipboard-text-outline"
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabItem
              focused={focused}
              label="Profile"
              IconComponent={Feather}
              iconName="user"
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: TAB_BAR_BG,
    borderTopWidth: 0,
    height: 80,
    paddingHorizontal: 16,
  },
  tabWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACTIVE_PILL,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  pillLabel: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: ACTIVE_TEXT,
  },
  iconOnly: {
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
