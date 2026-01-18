import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCart } from '../Context/CartContext';
import { useTheme } from '../Context/ThemeContext';
import { IMAGE_BASE_URL } from '../Services/Api';
import { DarkTheme, LightTheme } from '../Theme/Colors';
import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function Cart() {
  const { theme } = useTheme();
  const colors = theme === 'light' ? LightTheme : DarkTheme;

  const { cartItems, refreshCart, updateQuantity, removeFromCart } = useCart();

  useFocusEffect(
    useCallback(() => {
      refreshCart();
    }, [])
  );

  const getTotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleIncrease = (id: number, currentQty: number) => {
    if (currentQty < 10) {
      updateQuantity(id, currentQty + 1);
    }
  };

  const handleDecrease = (id: number, currentQty: number) => {
    if (currentQty > 1) {
      updateQuantity(id, currentQty - 1);
    }
  };

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push({ pathname: '/ProductDetails', params: { id: item.productId } })}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: `${IMAGE_BASE_URL}${item.imageURL}` }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity onPress={() => removeFromCart(item.productId)} style={styles.trashBtn}>
            <Ionicons name="trash-outline" size={20} color="red" />
          </TouchableOpacity>
        </View>

        <Text style={styles.price}>
          {item.price} PKR
        </Text>

        {/* Quantity Row */}
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={[
              styles.qtyBtn,
              { backgroundColor: colors.background },
              item.quantity <= 1 && styles.qtyBtnDisabled
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleDecrease(item.productId, item.quantity);
            }}
            disabled={item.quantity <= 1}
          >
            <Ionicons
              name="remove"
              size={16}
              color={item.quantity <= 1 ? '#ccc' : colors.text}
            />
          </TouchableOpacity>

          <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>

          <TouchableOpacity
            style={[
              styles.qtyBtn,
              { backgroundColor: colors.background },
              item.quantity >= 10 && styles.qtyBtnDisabled
            ]}
            onPress={(e) => {
              e.stopPropagation();
              handleIncrease(item.productId, item.quantity);
            }}
            disabled={item.quantity >= 10}
          >
            <Ionicons
              name="add"
              size={16}
              color={item.quantity >= 10 ? '#ccc' : colors.text}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Cart
        </Text>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item, index) =>
              item?.productId ? item.productId.toString() : index.toString()
            }
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
          />

          {/* Footer */}
          <View style={[styles.footer, { backgroundColor: colors.card }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
              <Text style={styles.totalAmount}>{getTotal()} PKR</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => router.push('/Checkout')}
            >
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <Text style={styles.checkoutText}> Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
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
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginLeft: 10 },

  card: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginVertical: 6,
    padding: 12,
    borderRadius: 16,
    elevation: 2,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: { width: 80, height: 80, backgroundColor: '#f9f9f9', borderRadius: 8 },
  info: { flex: 1, marginLeft: 15, justifyContent: 'space-between', height: 80 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 10 },
  trashBtn: { padding: 4 },
  price: { fontSize: 15, color: '#4CAF50', fontWeight: '600' },

  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  qtyBtn: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyText: { marginHorizontal: 12, fontSize: 16, fontWeight: 'bold' },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { fontSize: 16, color: '#999', marginTop: 10 },

  footer: {
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  totalLabel: { fontSize: 18, fontWeight: '500' },
  totalAmount: { fontSize: 22, fontWeight: 'bold', color: '#4CAF50' },

  checkoutBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    elevation: 3
  },

  checkoutText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
