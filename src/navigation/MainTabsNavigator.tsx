import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <IconComponent name={iconName} size={22} color={INACTIVE_ICON} />
    </View>
  );
}

// ---------- helpers ----------
const getLabel = (name: string) =>
  name === 'Map' ? 'Home' : name === 'Reservations' ? 'Sessions' : 'Profile';

// pill width based on icon + label + symmetric padding
const getPillWidthForRoute = (routeName: string, tabWidth: number) => {
  const label = getLabel(routeName);
  const charCount = label.length;

  const iconWidth = 24;
  const labelMargin = 8;
  const perChar = 11; // approximate char width
  const sidePadding = 16;

  const contentWidth = iconWidth + labelMargin + perChar * charCount;
  const rawWidth = contentWidth + 2 * sidePadding;

  return Math.min(rawWidth, tabWidth * 0.9);
};

const getIcon = (name: string, color: string, size: number) => {
  switch (name) {
    case 'Map':
      return <Ionicons name="home-outline" size={size} color={color} />;
    case 'Reservations':
      return <MaterialCommunityIcons name="clipboard-text-outline" size={size} color={color} />;
    case 'Profile':
      return <Feather name="user" size={size} color={color} />;
    default:
      return null;
  }
};

// ---------- custom animated tab bar ----------
function AnimatedTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { width } = Dimensions.get('window');
  const TAB_COUNT = state.routes.length;
  const tabWidth = width / TAB_COUNT;

  const barHeight = 80;
  const pillHeight = 36;

  const animatedIndex = useRef(new Animated.Value(state.index)).current;
  const animatedWidth = useRef(
    new Animated.Value(getPillWidthForRoute(state.routes[state.index].name, tabWidth))
  ).current;

  useEffect(() => {
    const activeRoute = state.routes[state.index];
    const targetWidth = getPillWidthForRoute(activeRoute.name, tabWidth);

    Animated.parallel([
      Animated.spring(animatedIndex, {
        toValue: state.index,
        useNativeDriver: false,
        friction: 10,
        tension: 80,
      }),
      Animated.spring(animatedWidth, {
        toValue: targetWidth,
        useNativeDriver: false,
        friction: 10,
        tension: 80,
      }),
    ]).start();
  }, [state.index, state.routes, tabWidth, animatedIndex, animatedWidth]);

  // pill horizontal movement
  const centerTranslateX = Animated.add(
    Animated.multiply(animatedIndex, new Animated.Value(tabWidth)),
    new Animated.Value(tabWidth / 2)
  );
  const pillTranslateX = Animated.subtract(
    centerTranslateX,
    Animated.divide(animatedWidth, new Animated.Value(2))
  );

  return (
    <View style={[styles.tabBar, { height: barHeight }]}>
      {/* sliding + resizing pill */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.pill,
          {
            height: pillHeight,
            top: (barHeight - pillHeight) / 2,
            width: animatedWidth,
            transform: [{ translateX: pillTranslateX }],
          },
        ]}
      />

      {/* tab items */}
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        // progress 0 → 1 for this tab (used for label zoom/fade)
        const focusProgress = animatedIndex.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [0, 1, 0],
          extrapolate: 'clamp',
        });

        const labelScale = focusProgress;
        const labelOpacity = focusProgress;

        const labelText = getLabel(route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // white when idle, black when selected
        const iconColor = isFocused ? '#000000' : '#FFFFFF';
        const labelColor = isFocused ? '#000000' : '#FFFFFF';

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[styles.tabItem, { width: tabWidth, height: barHeight }]}
            activeOpacity={0.8}
          >
            <View style={styles.tabContent}>
              {/* icon – color depends on focus */}
              {getIcon(route.name, iconColor, 22)}

              {/* label – only render for active tab */}
              {isFocused && (
                <Animated.Text
                  numberOfLines={1}
                  style={[
                    styles.label,
                    {
                      color: labelColor,
                      marginLeft: 8,
                      opacity: labelOpacity,
                      transform: [{ scale: labelScale }],
                    },
                  ]}
                >
                  {labelText}
                </Animated.Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---------- navigator ----------
export default function MainTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={props => <AnimatedTabBar {...props} />}
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
            <TabItem focused={focused} label="Profile" IconComponent={Feather} iconName="user" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ---------- styles ----------
const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#050608',
    borderTopWidth: 0,
  },
  pill: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: '#00F470', // your bright green
    zIndex: 0,
  },
  tabItem: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center', // vertical centering inside pill
    justifyContent: 'center', // horizontal centering
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
