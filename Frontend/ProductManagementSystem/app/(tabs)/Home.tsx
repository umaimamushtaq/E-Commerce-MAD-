import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../Context/ThemeContext';
import { Api, IMAGE_BASE_URL } from '../Services/Api';
import { DarkTheme, LightTheme } from '../Theme/Colors';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  imageURL: string;
}

import { useWindowDimensions } from 'react-native';

// Helper function to convert to Title Case
const toTitleCase = (str: string) =>
  str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1));

export default function Home() {
  const { width } = useWindowDimensions();
  const COLUMN_WIDTH = (width - 40) / 2;

  const { theme } = useTheme();
  const colors = theme === 'light' ? LightTheme : DarkTheme;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  /* Scroll to top when category changes */
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  }, [selectedCategory]);

  const slideAnim = useRef(new Animated.Value(-width * 0.6)).current; // Sidebar width 60%

  // Fetch products and extract categories
  const fetchProducts = async () => {
    try {
      const response = await Api.get('Product/ViewProducts');
      let data: Product[] = response.data;

      // Convert categories in product objects to Title Case
      data = data.map(p => ({
        ...p,
        category: toTitleCase(p.category),
      }));

      setProducts(data);

      // Extract unique categories (already in Title Case)
      const uniqueCategories = Array.from(new Set(data.map(p => p.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleSidebar = () => {
    Animated.timing(slideAnim, {
      toValue: sidebarOpen ? -width * 0.6 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
    setSidebarOpen(!sidebarOpen);
  };

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category === selectedCategory)
    : products;

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar}>
          <Ionicons name="menu" size={28} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {selectedCategory ? selectedCategory : 'Discover Products'}
        </Text>
      </View>

      {/* Products */}
      <FlatList
        ref={flatListRef}
        data={filteredProducts}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.8} style={[styles.card,
          { backgroundColor: colors.card, width: COLUMN_WIDTH }]} onPress={() => router.push({
            pathname: "/ProductDetails", params: { id: item.id }
          })}>
            <Image
              source={{ uri: `${IMAGE_BASE_URL}${item.imageURL}` }}
              style={styles.productImage}
              resizeMode="contain"
            />
            <View style={styles.details}>
              <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
                {item.name}
              </Text>
              <Text style={[styles.category, { color: colors.text }]}>
                {item.category} {/* Title Case */}
              </Text>
              <Text style={styles.price}>{Math.round(item.price)} PKR</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            width: width * 0.6,
            backgroundColor: colors.card,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Top row: Categories text + menu icon */}
        <View style={styles.sidebarTopRow}>
          <Text style={[styles.sidebarHeader, { color: colors.text }]}>Categories</Text>
          <TouchableOpacity onPress={toggleSidebar}>
            <Ionicons name="menu" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Category list: All Products first */}
        <FlatList
          data={['All Products', ...categories]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory(item === 'All Products' ? null : item);
                toggleSidebar();
              }}
              style={styles.sidebarItem}
            >
              <Text
                style={[
                  styles.sidebarText,
                  {
                    color: selectedCategory === item || (item === 'All Products' && !selectedCategory)
                      ? '#4CAF50'
                      : colors.text,
                    fontWeight: selectedCategory === item || (item === 'All Products' && !selectedCategory)
                      ? 'bold'
                      : 'normal',
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', marginLeft: 10 },
  listContainer: { paddingHorizontal: 10, paddingBottom: 20 },
  card: {
    margin: 5,
    borderRadius: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: { width: '100%', height: 150, marginBottom: 10 },
  details: { gap: 4 },
  title: { fontSize: 14, fontWeight: 'bold' },
  category: { fontSize: 12 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#4CAF50' },

  // Sidebar styles
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    padding: 20,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
  },
  sidebarTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sidebarHeader: { fontSize: 22, fontWeight: 'bold' },
  sidebarItem: { paddingVertical: 12 },
  sidebarText: { fontSize: 18 },
});
