import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

interface OrderItem {
    productId: number;
    quantity: number;
    unitPrice: number;
    product: {
        name: string;
    };
}

interface Order {
    id: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    orderItems: OrderItem[];
}

export default function Orders() {
    const { theme } = useTheme();
    const colors = theme === 'light' ? LightTheme : DarkTheme;

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [now, setNow] = useState(new Date());
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

    // Update current time every second for countdowns
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await Api.get('/Order/OrderHistory');
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchOrders();
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

    const handleMarkAsReceived = async (orderId: number) => {
        try {
            await Api.post(`/Order/MarkAsReceived/${orderId}`);
            fetchOrders();
        } catch (err) {
            console.error('Error marking order as received:', err);
            alert('Failed to update order status');
        }
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

    const renderOrderItem = ({ item }: { item: Order }) => {
        const orderTime = new Date(item.createdAt);
        // User requested 2 seconds for testing
        const deliveryTime = new Date(orderTime.getTime() + 10 * 1000);
        const diff = deliveryTime.getTime() - now.getTime();
        const canReceive = diff <= 0;
        const isExpanded = expandedOrders.has(item.id);

        const secondsLeft = Math.max(0, Math.floor(diff / 1000));

        return (
            <View style={[styles.orderCard, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => toggleExpand(item.id)}
                    style={styles.cardHeader}
                >
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.orderDate, { color: colors.text }]}>{formatDate(item.createdAt)}</Text>
                        <Text style={[styles.orderIdText, { color: '#888' }]}>Order #{item.id}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.orderStatus, {
                            color: item.status === 'Pending' ? '#FFA500' : '#4CAF50',
                            backgroundColor: item.status === 'Pending' ? '#FFF5E6' : '#E8F5E9'
                        }]}>
                            {item.status}
                        </Text>
                        <Ionicons
                            name={isExpanded ? "chevron-up" : "chevron-down"}
                            size={20}
                            color="#888"
                            style={{ marginTop: 5 }}
                        />
                    </View>
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <View style={styles.divider} />
                        <Text style={[styles.itemsTitle, { color: colors.text }]}>Items:</Text>
                        {item.orderItems.map((oi, idx) => (
                            <View key={idx} style={styles.productRow}>
                                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
                                    {oi.product?.name}
                                </Text>
                                <Text style={[styles.productQty, { color: colors.text }]}>x{oi.quantity}</Text>
                                <Text style={[styles.productPrice, { color: colors.text }]}>{oi.unitPrice * oi.quantity} PKR</Text>
                            </View>
                        ))}
                    </View>
                )}

                <View style={styles.divider} />

                <View style={styles.footerRow}>
                    <View>
                        <Text style={[styles.totalLabel, { color: '#888' }]}>Total Amount</Text>
                        <Text style={[styles.totalValue, { color: colors.text }]}>{item.totalAmount} PKR</Text>
                    </View>

                    {item.status === 'Pending' && (
                        <View style={styles.deliveryInfo}>
                            {!canReceive ? (
                                <View style={styles.timerRow}>
                                    <Ionicons name="time-outline" size={16} color="#888" />
                                    <Text style={styles.timerText}>Arriving in {secondsLeft}s...</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.receiveBtn}
                                    onPress={() => handleMarkAsReceived(item.id)}
                                >
                                    <Text style={styles.receiveBtnText}>Order Received</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#4CAF50" />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Order History
                </Text>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="receipt-outline" size={80} color="#ddd" />
                    <Text style={styles.emptyText}>No orders yet</Text>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.list}
                    refreshing={refreshing}
                    onRefresh={() => {
                        setRefreshing(true);
                        fetchOrders();
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 20 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    headerTitle: { fontSize: 26, fontWeight: 'bold' },
    list: { paddingHorizontal: 20, paddingBottom: 40 },
    orderCard: {
        padding: 15,
        borderRadius: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    orderDate: { fontSize: 16, fontWeight: 'bold' },
    orderIdText: { fontSize: 12, marginTop: 2 },
    orderStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        fontSize: 11,
        fontWeight: 'bold',
        overflow: 'hidden'
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    expandedContent: {
        paddingBottom: 5,
    },
    itemsTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8, color: '#888' },
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    productName: { flex: 2, fontSize: 14 },
    productQty: { flex: 0.5, fontSize: 14, textAlign: 'center', color: '#888' },
    productPrice: { flex: 1.5, fontSize: 14, textAlign: 'right', fontWeight: '500' },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    totalLabel: { fontSize: 11, marginBottom: 2 },
    totalValue: { fontSize: 18, fontWeight: 'bold' },
    deliveryInfo: { alignItems: 'flex-end' },
    timerRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    timerText: { fontSize: 13, color: '#FFA500', fontWeight: '600' },
    receiveBtn: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 8,
    },
    receiveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
        marginTop: 10,
    },
});

