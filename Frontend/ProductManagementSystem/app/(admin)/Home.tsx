import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../Context/ThemeContext';
import { Api } from '../Services/Api';
import { DarkTheme, LightTheme } from '../Theme/Colors';

interface Stats {
    totalSales: number;
    newCustomersLastWeek: number;
    totalCustomers: number;
}

export default function AdminHome() {
    const { theme } = useTheme();
    const colors = theme === 'light' ? LightTheme : DarkTheme;

    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await Api.get('Dashboard/Stats');
            setStats(res.data);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchStats(); }} colors={['#4CAF50']} />
            }
        >
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
            </View>

            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <Ionicons name="cart-outline" size={32} color="#4CAF50" />
                    <Text style={[styles.statValue, { color: colors.text }]}>{stats?.totalSales || 0}</Text>
                    <Text style={styles.statLabel}>Total Sales</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <Ionicons name="people-outline" size={32} color="#2196F3" />
                    <Text style={[styles.statValue, { color: colors.text }]}>{stats?.newCustomersLastWeek || 0}</Text>
                    <Text style={styles.statLabel}>New Customers (Week)</Text>
                </View>

                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <Ionicons name="people" size={32} color="#FF9800" />
                    <Text style={[styles.statValue, { color: colors.text }]}>{stats?.totalCustomers || 0}</Text>
                    <Text style={styles.statLabel}>Total Customers</Text>
                </View>
            </View>

            <View style={[styles.welcomeCard, { backgroundColor: colors.card }]}>
                <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome Back, Admin!</Text>
                <Text style={styles.welcomeSubtitle}>Quickly manage your store products and orders from the tabs below.</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 20, marginBottom: 20 },
    headerTitle: { fontSize: 28, fontWeight: 'bold' },
    statsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, gap: 10, marginBottom: 20 },
    statCard: { flex: 1, minWidth: '45%', padding: 20, borderRadius: 15, alignItems: 'center', elevation: 2 },
    statValue: { fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
    statLabel: { fontSize: 13, color: '#888' },
    welcomeCard: { marginHorizontal: 20, padding: 25, borderRadius: 15, elevation: 2 },
    welcomeTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    welcomeSubtitle: { fontSize: 15, color: '#888', lineHeight: 22 }
});
