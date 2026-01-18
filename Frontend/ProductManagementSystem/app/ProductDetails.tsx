import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from './Context/CartContext';
import { useTheme } from './Context/ThemeContext';
import { Api, IMAGE_BASE_URL } from './Services/Api';
import { DarkTheme, LightTheme } from './Theme/Colors';

const { height } = Dimensions.get('window');

export default function ProductDetails() {
  const { theme } = useTheme();
  const colors = theme === 'light' ? LightTheme : DarkTheme;

  const { id } = useLocalSearchParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const productId = Number(id);

  useEffect(() => {
    const fetchSingleProduct = async () => {
      try {
        const response = await Api.get(`Product/ProductById`, { params: { id } });
        setProduct(response.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSingleProduct();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart({
      productId: productId, // Use the ID from params
      name: product.name,
      price: product.price,
      imageURL: product.imageURL,
      quantity,
    });

    router.back(); // smooth UX, no alert
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Back Button (Arrow) */}
      <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.card }]}
        onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: `${IMAGE_BASE_URL}${product.imageURL}` }}
          style={styles.img} />

        <Text style={[styles.cat, { color: colors.text }]}>{product.category}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{product.name}</Text>

        <View style={styles.row}>
          <Text style={[styles.price, { color: colors.text }]}>{product.price} PKR</Text>

          {/* Rating Section */}
          <View style={styles.ratingBox}>
            <Text style={[styles.rate, { color: colors.text }]}>⭐ {product.rating.toFixed(1)}</Text>
            <Text style={styles.count}>({product.ratingCount} reviews)</Text>
          </View>
        </View>

        <Text style={[styles.descTitle, { color: colors.text }]}>Product Description</Text>
        <Text style={[styles.descText, { color: colors.text }]}>{product.description}</Text>

        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => quantity > 1 && setQuantity(quantity - 1)}
          >
            <Text style={styles.qtyText}>−</Text>
          </TouchableOpacity>

          <Text style={[styles.qtyNumber, { color: colors.text }]}>{quantity}</Text>

          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(quantity + 1)}
          >
            <Text style={styles.qtyText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={[styles.buyBtn, { backgroundColor: '#4CAF50' }]}
          activeOpacity={0.8} onPress={handleAddToCart}>
          <Text style={styles.buyBtnTxt}>Add to Cart</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  scrollContent: {
    padding: 25,
    paddingTop: 40,
  },
  img: {
    width: '100%',
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  cat: {
    fontSize: 12,
    color: '#888',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  price: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  count: {
    fontSize: 12,
    color: '#aaa',
    marginLeft: 5,
  },
  descTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 30,
  },
  buyBtn: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  buyBtnTxt: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },

  qtyText: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  qtyNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
  }

});