import type { ComponentType } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ResultsScreen } from '../screens/ResultsScreen';
import { PracticeScreen } from '../screens/PracticeScreen';
import { AvatarsScreen } from '../screens/AvatarsScreen';
import { RatingsScreen } from '../screens/RatingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import {
  ResultsIcon,
  PracticeIcon,
  AvatarsIcon,
  RatingsIcon,
  ProfileIcon,
} from '../components/icons/NavIcons';
import { colors, typography } from '../theme';

const Tab = createBottomTabNavigator();

type TabName = 'Results' | 'Practice' | 'Avatars' | 'Ratings' | 'Profile';

interface IconProps {
  size?: number;
  color: string;
}

const TAB_CONFIG: { name: TabName; icon: ComponentType<IconProps> }[] = [
  { name: 'Results', icon: ResultsIcon },
  { name: 'Practice', icon: PracticeIcon },
  { name: 'Avatars', icon: AvatarsIcon },
  { name: 'Ratings', icon: RatingsIcon },
  { name: 'Profile', icon: ProfileIcon },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const routeNames = state.routes.map((r) => r.name);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBar, { height: 76 + insets.bottom, paddingBottom: insets.bottom }]}>
      {TAB_CONFIG.map((tab) => {
        const routeIndex = routeNames.indexOf(tab.name);
        const isFocused = state.index === routeIndex;
        const route = state.routes[routeIndex];
        const Icon = tab.icon;

        const onPress = () => {
          if (!route) return;
          // Always emit tabPress so focused tabs can pop nested overlay state
          // (trait detail, streak, methodology, etc.) back to the tab root.
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={tab.name}
            onPress={onPress}
            style={styles.tabItem}
            android_ripple={{ color: 'transparent' }}
          >
            <Icon size={24} color={isFocused ? colors.textPrimary : colors.textSecondary} />
            <Text
              style={[
                styles.tabLabel,
                { color: isFocused ? colors.textPrimary : colors.textSecondary },
              ]}
            >
              {tab.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Results" component={ResultsScreen} />
      <Tab.Screen name="Practice" component={PracticeScreen} />
      <Tab.Screen name="Avatars" component={AvatarsScreen} />
      <Tab.Screen name="Ratings" component={RatingsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 11,
  },
});
