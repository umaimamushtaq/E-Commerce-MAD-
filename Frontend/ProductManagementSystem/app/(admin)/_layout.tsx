import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { useTheme } from '../Context/ThemeContext';
import { DarkTheme, LightTheme } from '../Theme/Colors';

export default function AdminLayout() {
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
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="apps-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="AdminProducts"
                options={{
                    title: 'Products',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="cube-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="AdminOrders"
                options={{
                    title: 'All Orders',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="list-outline" size={size} color={color} />
                    ),
                }}
            />

            <Tabs.Screen
                name="Settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color, size }: { color: string; size: number }) => (
                        <Ionicons name="settings-outline" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
