import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useCart } from '../Context/CartContext';
import { useTheme } from '../Context/ThemeContext';
import { DarkTheme, LightTheme } from '../Theme/Colors';


export default function TabsLayout() {
  const { theme } = useTheme();
  const colors = theme === 'light' ? LightTheme : DarkTheme;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.card,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => {
            const { cartCount } = useCart();

            return (
              <View>
                <Ionicons name="cart-outline" size={size} color={color} />

                {cartCount > 0 && (
                  <View
                    style={{
                      position: 'absolute',
                      right: -6,
                      top: -3,
                      backgroundColor: 'red',
                      borderRadius: 8,
                      minWidth: 16,
                      height: 16,
                      justifyContent: 'center',
                      alignItems: 'center',
                      paddingHorizontal: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}
                    >
                      {cartCount}
                    </Text>
                  </View>
                )}
              </View>
            );
          },
        }}
      />

      <Tabs.Screen
        name="Orders"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Settings"
        options={{
          title: 'Setting',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
