import { Tabs } from "expo-router";
import React, { useRef, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import APP_FONT_FAMILY from "@/components/styles/font";
import { Colors } from "@/constants/theme";

type TabItem = {
  name: string;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconFocused: React.ComponentProps<typeof Ionicons>["name"];
};



function AnimatedTabIcon({
  focused,
  icon,
  iconFocused,
  label,
}: {
  focused: boolean;
  icon: React.ComponentProps<typeof Ionicons>["name"];
  iconFocused: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: focused ? -6 : 0,
      useNativeDriver: true,
    }).start();

    Animated.spring(scale, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View
      style={[
        styles.tabItemContainer,
        { transform: [{ translateY }, { scale }] },
      ]}
    >
      <Ionicons
        name={focused ? iconFocused : icon}
        size={24}
        color={focused ? Colors.light.background : Colors.light.tabIconDefault}
      />

      <Animated.Text
        style={[
          styles.tabLabel,
          { color: focused ? Colors.light.background : Colors.light.tabIconDefault },
        ]}
      >
        {label}
      </Animated.Text>
    </Animated.View>
  );
}

function FloatingHomeButton({
  focused,
  onPress,
}: {
  focused: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Animated.View
        style={[
          styles.homeButton,
          { transform: [{ scale }] },
        ]}
      >
        <Ionicons name="home" size={30} color={Colors.light.background} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.outerBar, { paddingBottom: insets.bottom || 12 }]}>
      <View style={styles.bar}>
        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation.navigate("itinerary")}
        >
          <AnimatedTabIcon
            focused={state.index === 0}
            icon="navigate-outline"
            iconFocused="navigate"
            label="Itinerary"
          />
        </TouchableOpacity>

        <View style={{ width: 70 }} />

        <TouchableOpacity
          style={styles.tabBtn}
          onPress={() => navigation.navigate("wallet")}
        >
          <AnimatedTabIcon
            focused={state.index === 2}
            icon="wallet-outline"
            iconFocused="wallet"
            label="مصاريفي"
          />
        </TouchableOpacity>
      </View>

      <View style={styles.homeWrapper}>
        <FloatingHomeButton
          focused={state.index === 1}
          onPress={() => navigation.navigate("index")}
        />
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="itinerary" />
      <Tabs.Screen name="index" />
      <Tabs.Screen name="wallet" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  outerBar: {
    position: "relative",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "transparent",
  },

  bar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    borderRadius: 28,
    height: 70,
    width: "100%",
    paddingHorizontal: 20,

    ...Platform.select({
      ios: {
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },

  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  tabItemContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  tabLabel: {
    fontFamily: APP_FONT_FAMILY,
    fontSize: 10,
    marginTop: 4,
  },

  homeWrapper: {
    position: "absolute",
    top: -30,
  },

  homeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.secondary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: Colors.light.primary,

    ...Platform.select({
      ios: {
        shadowColor: Colors.light.secondary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
      },
      android: {
        elevation: 14,
      },
    }),
  },
});