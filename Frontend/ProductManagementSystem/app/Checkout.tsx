import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useCart } from './Context/CartContext';
import { useTheme } from './Context/ThemeContext';
import { Api } from './Services/Api';
import { DarkTheme, LightTheme } from './Theme/Colors';

export default function Checkout() {
    const { theme } = useTheme();
    const colors = theme === 'light' ? LightTheme : DarkTheme;
    const { cartItems, clearCart } = useCart();

    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [addressError, setAddressError] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [generalError, setGeneralError] = useState('');

    const deliveryCharges = 300;
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const total = subtotal + deliveryCharges;

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await Api.get('/User/Profile');
            const data = response.data;
            setAddress(data.address || '');

            // If phone exists, strip +92 for the input field
            if (data.phone) {
                const cleanPhone = data.phone.replace('+92', '').replace(/\s/g, '');
                setPhone(cleanPhone);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        let hasError = false;

        if (!address.trim()) {
            setAddressError('Address is required');
            hasError = true;
        } else {
            setAddressError('');
        }

        if (!phone.trim()) {
            setPhoneError('Phone number is required');
            hasError = true;
        } else if (phone.length !== 10 || !/^\d+$/.test(phone)) {
            setPhoneError('Phone must be 10 digits (e.g. 3001234567)');
            hasError = true;
        } else {
            setPhoneError('');
        }

        if (hasError) return;

        setPlacingOrder(true);
        setGeneralError('');

        try {
            const orderData = {
                cartItems: cartItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
                shippingAddress: address,
                phoneNumber: '+92' + phone,
            };

            await Api.post('/Order/PlaceOrder', orderData);

            // Success delay for animation feel
            setTimeout(async () => {
                await clearCart();
                setPlacingOrder(false);
                router.replace('/(tabs)/Orders');
            }, 1000);

        } catch (err: any) {
            console.error('Error placing order:', err);
            setGeneralError(err.response?.data || 'Failed to place order. Please try again.');
            setPlacingOrder(false);
        }
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
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Checkout</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Shipping Info */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Shipping Information</Text>

                    <Text style={[styles.label, { color: colors.text }]}>Delivery Address</Text>
                    <TextInput
                        style={[styles.input, { color: colors.text, borderColor: addressError ? 'red' : '#ddd' }]}
                        value={address}
                        onChangeText={(val) => {
                            setAddress(val);
                            if (val.trim()) setAddressError('');
                        }}
                        placeholder="Enter full address"
                        placeholderTextColor="#888"
                        multiline
                    />
                    {addressError ? <Text style={styles.inlineError}>{addressError}</Text> : null}

                    <Text style={[styles.label, { color: colors.text, marginTop: 15 }]}>Phone Number</Text>
                    <View style={[styles.phoneContainer, { borderColor: phoneError ? 'red' : '#ddd' }]}>
                        <Text style={styles.flag}>🇵🇰</Text>
                        <Text style={[styles.prefix, { color: colors.text }]}>+92</Text>
                        <View style={styles.dividerVertical} />
                        <TextInput
                            style={[styles.phoneInput, { color: colors.text }]}
                            value={phone}
                            onChangeText={(val) => {
                                const clean = val.replace(/[^\d]/g, '').slice(0, 10);
                                setPhone(clean);
                                if (clean.length === 10) setPhoneError('');
                            }}
                            placeholder="3001234567"
                            placeholderTextColor="#888"
                            keyboardType="phone-pad"
                        />
                    </View>
                    {phoneError ? <Text style={styles.inlineError}>{phoneError}</Text> : null}
                </View>

                {/* Order Summary */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Order Summary</Text>

                    <View style={styles.summaryRow}>
                        <Text style={{ color: colors.text }}>Subtotal</Text>
                        <Text style={{ color: colors.text }}>{subtotal} PKR</Text>
                    </View>

                    <View style={styles.summaryRow}>
                        <Text style={{ color: colors.text }}>Delivery Charges</Text>
                        <Text style={{ color: colors.text }}>{deliveryCharges} PKR</Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
                        <Text style={styles.totalValue}>{total} PKR</Text>
                    </View>
                </View>

                {/* Payment Method */}
                <View style={[styles.section, { backgroundColor: colors.card }]}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
                    <View style={styles.paymentRow}>
                        <Ionicons name="cash-outline" size={24} color="#4CAF50" />
                        <Text style={[styles.paymentText, { color: colors.text }]}>Cash on Delivery (COD)</Text>
                    </View>
                </View>

                {generalError ? <Text style={styles.errorText}>{generalError}</Text> : null}

                <TouchableOpacity
                    style={[styles.placeOrderBtn, { opacity: placingOrder ? 0.7 : 1 }]}
                    onPress={handlePlaceOrder}
                    disabled={placingOrder}
                >
                    {placingOrder ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.placeOrderText}>Place Order (COD)</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 20 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backBtn: { padding: 5 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', marginLeft: 15 },

    content: { padding: 20 },

    section: {
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },

    label: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
        textAlignVertical: 'top',
    },
    phoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 50,
    },
    flag: { fontSize: 20, marginRight: 5 },
    prefix: { fontSize: 16, fontWeight: 'bold', marginRight: 5 },
    dividerVertical: {
        width: 1,
        height: '60%',
        backgroundColor: '#eee',
        marginHorizontal: 10,
    },
    phoneInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    inlineError: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },

    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 10,
    },
    totalLabel: { fontSize: 18, fontWeight: 'bold' },
    totalValue: { fontSize: 20, fontWeight: 'bold', color: '#4CAF50' },

    paymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    paymentText: { fontSize: 16, fontWeight: '500' },

    errorText: { color: 'red', textAlign: 'center', marginBottom: 15 },

    placeOrderBtn: {
        backgroundColor: '#4CAF50',
        paddingVertical: 18,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 40,
    },
    placeOrderText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
