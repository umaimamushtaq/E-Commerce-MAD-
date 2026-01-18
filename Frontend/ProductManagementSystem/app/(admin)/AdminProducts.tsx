import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useWindowDimensions
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

const toTitleCase = (str: string) =>
    str ? str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.slice(1)) : '';

export default function AdminProducts() {
    const { width } = useWindowDimensions();
    const COLUMN_WIDTH = (width - 40) / 2;
    const { theme } = useTheme();
    const colors = theme === 'light' ? LightTheme : DarkTheme;

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formName, setFormName] = useState('');
    const [formPrice, setFormPrice] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formCategory, setFormCategory] = useState('');
    const [formImageUrl, setFormImageUrl] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Dropdown states
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [isOtherCategory, setIsOtherCategory] = useState(false);
    const [newCategoryText, setNewCategoryText] = useState('');

    // Delete Confirmation Modal state
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [productToDelete, setProductToDelete] = useState<number | null>(null);

    const slideAnim = useRef(new Animated.Value(-width * 0.6)).current;
    const flatListRef = useRef<FlatList>(null);

    const fetchProducts = async () => {
        try {
            const response = await Api.get('Product/ViewProducts');
            let data: Product[] = response.data;
            data = data.map(p => ({ ...p, category: toTitleCase(p.category) }));
            setProducts(data);
            const uniqueCategories = Array.from(new Set(data.map(p => p.category)));
            setCategories(uniqueCategories);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
        }, [])
    );

    const toggleSidebar = () => {
        Animated.timing(slideAnim, {
            toValue: sidebarOpen ? -width * 0.6 : 0,
            duration: 250,
            useNativeDriver: false,
        }).start();
        setSidebarOpen(!sidebarOpen);
    };

    const handleDelete = (id: number) => {
        setProductToDelete(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        if (productToDelete === null) return;
        try {
            await Api.delete(`Product/DeleteProduct/${productToDelete}`);
            fetchProducts();
            setDeleteModalVisible(false);
            setProductToDelete(null);
            Alert.alert("Success", "Product deleted successfully");
        } catch (err) {
            console.error('Failed to delete product', err);
            Alert.alert("Error", "Failed to delete product. Please try again.");
            setDeleteModalVisible(false);
            setProductToDelete(null);
        }
    };

    const openModal = (product: Product | null = null) => {
        if (product) {
            setEditingProduct(product);
            setFormName(product.name);
            setFormPrice(product.price.toString());
            setFormDesc(product.description);
            setFormCategory(product.category);
            setFormImageUrl(product.imageURL);
        } else {
            setEditingProduct(null);
            setFormName('');
            setFormPrice('');
            setFormDesc('');
            setFormCategory('');
            setFormImageUrl('');
        }
        setSelectedImage(null);
        setFormError(null);
        setShowCategoryDropdown(false);
        setIsOtherCategory(false);
        setNewCategoryText('');
        setModalVisible(true);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setSelectedImage(asset.uri);

            // Extract original filename (e.g., mouse.png)
            // If the user's phone provides a cryptic name, they must ensure it matches the server file.
            const filename = asset.fileName || asset.uri.split('/').pop() || 'product.png';

            // Set the URL exactly as it should be stored in the DB (relative to wwwroot)
            setFormImageUrl(`Images/${filename}`);
        }
    };

    const handleSave = async () => {
        setFormError(null);
        const categoryToSave = isOtherCategory ? newCategoryText : formCategory;

        if (!formName || !formPrice || !categoryToSave) {
            setFormError('Please fill name, price and category');
            return;
        }

        if (!selectedImage && !formImageUrl) {
            setFormError('Please select an image');
            return;
        }

        setSaving(true);
        try {
            const price = parseInt(formPrice);
            if (isNaN(price)) {
                setFormError('Price must be a valid number');
                setSaving(false);
                return;
            }

            const payload = {
                name: formName,
                description: formDesc,
                price: price,
                category: categoryToSave,
                imageURL: formImageUrl // Use manual input directly
            };

            if (editingProduct) {
                await Api.put(`Product/UpdateProduct/${editingProduct.id}`, payload);
                await fetchProducts();
            } else {
                await Api.post('Product/AddProduct', payload);
                await fetchProducts();
                // Scroll to bottom after adding new product
                setTimeout(() => {
                    flatListRef.current?.scrollToEnd({ animated: true });
                }, 500);
            }
            setModalVisible(false);
        } catch (err) {
            console.error('Error saving product:', err);
            setFormError('Something went wrong, try again');
        } finally {
            setSaving(false);
        }
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
                    Manage Products
                </Text>
            </View>

            {/* Product List */}
            <FlatList
                ref={flatListRef}
                data={filteredProducts}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                onRefresh={() => { setRefreshing(true); fetchProducts(); }}
                refreshing={refreshing}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                    <View style={[styles.card, { backgroundColor: colors.card, width: COLUMN_WIDTH }]}>
                        <Image
                            source={{ uri: `${IMAGE_BASE_URL}${item.imageURL}` }}
                            style={styles.productImage}
                            resizeMode="contain"
                        />
                        <View style={styles.details}>
                            <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>{item.name}</Text>
                            <Text style={[styles.price, { color: '#4CAF50' }]}>{item.price} PKR</Text>

                            <View style={styles.actionRow}>
                                <TouchableOpacity onPress={() => openModal(item)} style={styles.actionBtn}>
                                    <Ionicons name="pencil" size={18} color="#2196F3" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                                    <Ionicons name="trash" size={18} color="#F44336" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            />

            {/* Floating Add Button */}
            <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>

            {/* Sidebar */}
            <Animated.View style={[styles.sidebar, { width: width * 0.6, backgroundColor: colors.card, transform: [{ translateX: slideAnim }] }]}>
                <View style={styles.sidebarTopRow}>
                    <Text style={[styles.sidebarHeader, { color: colors.text }]}>Categories</Text>
                    <TouchableOpacity onPress={toggleSidebar}>
                        <Ionicons name="menu" size={28} color={colors.text} />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={['All Products', ...categories]}
                    keyExtractor={(it) => it}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedCategory(item === 'All Products' ? null : item);
                                toggleSidebar();
                                // Scroll to top when category changes
                                setTimeout(() => {
                                    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
                                }, 300);
                            }}
                            style={styles.sidebarItem}
                        >
                            <Text style={[styles.sidebarText, { color: selectedCategory === item || (item === 'All Products' && !selectedCategory) ? '#4CAF50' : colors.text, fontWeight: selectedCategory === item ? 'bold' : 'normal' }]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </Animated.View>

            {/* Add/Edit Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>{editingProduct ? 'Edit Product' : 'Add New Product'}</Text>

                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Name" placeholderTextColor="#999" value={formName} onChangeText={setFormName} />
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border }]} placeholder="Price" placeholderTextColor="#999" value={formPrice} onChangeText={(text) => setFormPrice(text.replace(/[^0-9]/g, ''))} keyboardType="numeric" />
                        <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, height: 80 }]} placeholder="Description" placeholderTextColor="#999" value={formDesc} onChangeText={setFormDesc} multiline />

                        {/* Category Selector */}
                        <TouchableOpacity
                            style={[styles.input, { borderColor: colors.border, justifyContent: 'center' }]}
                            onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={{ color: (formCategory || isOtherCategory) ? colors.text : '#999', fontSize: 16 }}>
                                    {isOtherCategory ? 'Other' : (formCategory || 'Select Category')}
                                </Text>
                                <Ionicons name={showCategoryDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
                            </View>
                        </TouchableOpacity>

                        {showCategoryDropdown && (
                            <View style={[styles.dropdownContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <ScrollView nestedScrollEnabled={true}>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={styles.dropdownItem}
                                            onPress={() => {
                                                setFormCategory(cat);
                                                setIsOtherCategory(false);
                                                setShowCategoryDropdown(false);
                                            }}
                                        >
                                            <Text style={[styles.dropdownText, { color: colors.text }]}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                    <TouchableOpacity
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setIsOtherCategory(true);
                                            setFormCategory('');
                                            setShowCategoryDropdown(false);
                                        }}
                                    >
                                        <Text style={[styles.dropdownText, { color: colors.text }]}>Other</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        )}

                        {isOtherCategory && (
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                                placeholder="Enter New Category"
                                placeholderTextColor="#999"
                                value={newCategoryText}
                                onChangeText={setNewCategoryText}
                            />
                        )}

                        <View>
                            <View style={styles.imagePickerSection}>
                                <TouchableOpacity style={[styles.pickBtn, { borderColor: colors.border }]} onPress={pickImage}>
                                    <Ionicons name="camera" size={20} color="#4CAF50" />
                                    <Text style={[styles.pickBtnText, { color: colors.text }]}>
                                        {selectedImage || formImageUrl ? 'Change Image' : 'Pick Image'}
                                    </Text>
                                </TouchableOpacity>
                                {(selectedImage || formImageUrl) && (
                                    <Image
                                        source={{ uri: selectedImage || `${IMAGE_BASE_URL}${formImageUrl}` }}
                                        style={styles.modalPreview}
                                    />
                                )}
                            </View>
                        </View>

                        {formError && (
                            <Text style={styles.errorText}>
                                {formError}
                            </Text>
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#888' }]} onPress={() => setModalVisible(false)}>
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#4CAF50' }]} onPress={handleSave} disabled={saving}>
                                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>Save</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Custom Delete Confirmation Modal */}
            <Modal visible={deleteModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.deleteModalContent, { backgroundColor: colors.card }]}>
                        <Ionicons name="warning" size={50} color="#F44336" style={{ alignSelf: 'center', marginBottom: 10 }} />
                        <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center' }]}>Confirm Delete</Text>
                        <Text style={{ color: colors.text, textAlign: 'center', fontSize: 16 }}>
                            Are you sure you want to delete this product?
                        </Text>

                        <View style={[styles.modalButtons, { marginTop: 20 }]}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: '#888' }]}
                                onPress={() => { setDeleteModalVisible(false); setProductToDelete(null); }}
                            >
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: '#F44336' }]}
                                onPress={confirmDelete}
                            >
                                <Text style={styles.modalBtnText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 20 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
    headerTitle: { fontSize: 24, fontWeight: 'bold', marginLeft: 10 },
    listContainer: { paddingHorizontal: 10, paddingBottom: 100 },
    card: {
        margin: 5,
        borderRadius: 12,
        padding: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    productImage: { width: '100%', height: 100, marginBottom: 8 },
    details: { gap: 4 },
    title: { fontSize: 13, fontWeight: 'bold' },
    price: { fontSize: 15, fontWeight: 'bold' },
    actionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 5, gap: 5 },
    actionBtn: { padding: 10, minWidth: 40, alignItems: 'center' }, // Increased padding and added min-width
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#4CAF50',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    sidebar: { position: 'absolute', top: 0, left: 0, height: '100%', padding: 20, zIndex: 100, elevation: 10 },
    sidebarTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    sidebarHeader: { fontSize: 22, fontWeight: 'bold' },
    sidebarItem: { paddingVertical: 12 },
    sidebarText: { fontSize: 18 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { borderRadius: 15, padding: 20, gap: 15 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    modalBtn: { flex: 0.45, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    modalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    imagePickerSection: { flexDirection: 'row', alignItems: 'center', gap: 15, marginVertical: 5 },
    pickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderRadius: 8, paddingVertical: 12, borderStyle: 'dashed' },
    pickBtnText: { fontSize: 14, fontWeight: '500' },
    modalPreview: { width: 60, height: 60, borderRadius: 8 },
    errorText: { color: 'red', fontSize: 14, textAlign: 'center', marginBottom: 5 },
    dropdownContainer: {
        borderWidth: 1,
        borderRadius: 8,
        marginTop: -10,
        maxHeight: 150,
        overflow: 'hidden'
    },
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee'
    },
    dropdownText: {
        fontSize: 16
    },
    deleteModalContent: {
        borderRadius: 15,
        padding: 25,
        width: '80%',
        alignSelf: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 5
    }
});
