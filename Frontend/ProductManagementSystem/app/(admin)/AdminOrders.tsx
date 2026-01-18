import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import { useTheme } from '../Context/ThemeContext';
import { Api } from '../Services/Api';
import { DarkTheme, LightTheme } from '../Theme/Colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Product {
    name: string;
}

interface OrderItem {
    product: Product;
    quantity: number;
    unitPrice: number;
}

interface User {
    username: string;
    email: string;
}

interface Order {
    id: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    user: User;
    orderItems: OrderItem[];
}

export default function AdminOrders() {
    const { theme } = useTheme();
    const colors = theme === 'light' ? LightTheme : DarkTheme;

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

    const fetchAllOrders = async () => {
        try {
            const response = await Api.get('Order/AllOrders');
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching all orders:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAllOrders();
        }, [])
    );

    const toggleExpand = (orderId: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    All Customer Orders
                </Text>
            </View>

            <FlatList
                data={orders}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.list}
                onRefresh={() => { setRefreshing(true); fetchAllOrders(); }}
                refreshing={refreshing}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => {
                    const isExpanded = expandedOrders.has(item.id);
                    return (
                        <View style={[styles.card, { backgroundColor: colors.card }]}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => toggleExpand(item.id)}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.orderId, { color: colors.text }]}>Order #{item.id}</Text>
                                        <Text style={[styles.date, { color: '#888' }]}>{formatDate(item.createdAt)}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={[styles.status, {
                                            color: item.status === 'Pending' ? '#FFA500' : '#4CAF50',
                                            backgroundColor: item.status === 'Pending' ? '#FFF5E6' : '#E8F5E9'
                                        }]}>
                                            {item.status}
                                        </Text>
                                        <Ionicons
                                            name={isExpanded ? "chevron-up" : "chevron-down"}
                                            size={18}
                                            color="#888"
                                            style={{ marginTop: 4 }}
                                        />
                                    </View>
                                </View>

                                <View style={styles.userRow}>
                                    <Ionicons name="person-outline" size={14} color="#888" />
                                    <Text style={[styles.userName, { color: colors.text }]}>
                                        {item.user?.username}
                                    </Text>
                                </View>
                            </TouchableOpacity>

                            {isExpanded && (
                                <View style={styles.expandedContent}>
                                    <View style={styles.divider} />
                                    <Text style={[styles.itemsTitle, { color: '#888' }]}>Order Details:</Text>
                                    {item.orderItems.map((oi, idx) => (
                                        <View key={idx} style={styles.productRow}>
                                            <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
                                                {oi.product?.name}
                                            </Text>
                                            <Text style={[styles.productQty, { color: colors.text }]}>x{oi.quantity}</Text>
                                            <Text style={[styles.productPrice, { color: colors.text }]}>{oi.unitPrice * oi.quantity} PKR</Text>
                                        </View>
                                    ))}
                                    <View style={styles.divider} />
                                    <View style={styles.totalRow}>
                                        <Text style={[styles.totalLabel, { color: '#888' }]}>Total Revenue:</Text>
                                        <Text style={[styles.totalValue, { color: colors.text }]}>{item.totalAmount} PKR</Text>
                                    </View>
                                </View>
                            )}

                            {!isExpanded && (
                                <View style={styles.quickTotal}>
                                    <Text style={[styles.quickTotalValue, { color: colors.text }]}>{item.totalAmount} PKR</Text>
                                </View>
                            )}
                        </View>
                    );
                }}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="receipt-outline" size={80} color="#ddd" />
                        <Text style={styles.emptyText}>No orders found</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingHorizontal: 20, marginBottom: 15 },
    headerTitle: { fontSize: 26, fontWeight: 'bold' },
    list: { paddingHorizontal: 20, paddingBottom: 40 },
    card: {
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    orderId: { fontSize: 17, fontWeight: 'bold' },
    date: { fontSize: 12, marginTop: 2 },
    status: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 'bold',
        overflow: 'hidden'
    },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    userName: { fontSize: 13, fontWeight: '500' },
    expandedContent: { marginTop: 5 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
    itemsTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
    productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    productName: { flex: 2, fontSize: 14 },
    productQty: { flex: 0.5, fontSize: 14, textAlign: 'center', color: '#888' },
    productPrice: { flex: 1.5, fontSize: 14, textAlign: 'right', fontWeight: '500' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    totalLabel: { fontSize: 13, fontWeight: 'bold' },
    totalValue: { fontSize: 18, fontWeight: 'bold' },
    quickTotal: { marginTop: 10, alignItems: 'flex-end' },
    quickTotalValue: { fontSize: 15, fontWeight: 'bold' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { fontSize: 18, color: '#999', marginTop: 10 },
});
