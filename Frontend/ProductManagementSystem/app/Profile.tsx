import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { useTheme } from './Context/ThemeContext';
import { Api } from './Services/Api';
import { DarkTheme, LightTheme } from './Theme/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function Profile() {
    const { theme } = useTheme();
    const colors = theme === 'light' ? LightTheme : DarkTheme;

    const scrollViewRef = useRef<ScrollView>(null);

    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');

    // Dropdown state
    const [genderOpen, setGenderOpen] = useState(false);

    // Loading state for update action
    const [updating, setUpdating] = useState(false);

    // Error states
    const [phoneError, setPhoneError] = useState('');
    const [genderError, setGenderError] = useState('');
    const [addressError, setAddressError] = useState('');

    // General Error state
    const [generalError, setGeneralError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await Api.get('/User/Profile');
            const data = response.data;
            setUsername(data.username);
            setEmail(data.email);
            setPhone(data.phone || '');
            setGender(data.gender || '');
            setAddress(data.address || '');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        let valid = true;
        setPhoneError('');
        setGenderError('');
        setAddressError('');
        setGeneralError('');

        // Validate Phone if provided
        if (phone.trim() && !/^\d{10}$/.test(phone)) {
            setPhoneError('Phone number must be 10 digits');
            valid = false;
        }

        if (!valid) return;

        setUpdating(true); // Start animation

        try {
            // Minimum delay of 2 seconds to show animation
            const minDelay = new Promise(resolve => setTimeout(resolve, 2000));

            const updatePromise = (async () => {
                await Api.put(
                    '/User/UpdateProfile',
                    {
                        phone,
                        gender,
                        address
                    }
                );
                // Refetch data to refresh the page
                await fetchProfile();
            })();

            await Promise.all([updatePromise, minDelay]);

            // Scroll to top to show update occurred
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });

            // Optional: Success indication if desired, but user just said "reload page"
        } catch (err: any) {
            console.error(err);
            setGeneralError(err.response?.data || 'Failed to update profile');
        } finally {
            setUpdating(false); // Stop animation
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: colors.text }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.header, { color: colors.text }]}>Profile</Text>
            </View>

            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={styles.form}
                showsVerticalScrollIndicator={false}
            >

                {/* Username */}
                <Text style={[styles.label, { color: colors.text }]}>Username</Text>
                <View style={[styles.readOnlyInput, { backgroundColor: colors.card }]}>
                    <Text style={{ color: colors.text, opacity: 0.7 }}>{username}</Text>
                </View>

                {/* Email */}
                <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                <View style={[styles.readOnlyInput, { backgroundColor: colors.card }]}>
                    <Text style={{ color: colors.text, opacity: 0.7 }}>{email}</Text>
                </View>

                {/* Phone with +92 Prefix */}
                <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
                <View style={[styles.phoneContainer, { backgroundColor: colors.card, borderColor: '#ddd' }]}>
                    <Text style={[styles.phonePrefix, { color: colors.text }]}>+92</Text>
                    <View style={styles.verticalDivider} />
                    <TextInput
                        value={phone}
                        onChangeText={(t) => {
                            setPhone(t);
                            if (t) setPhoneError('');
                        }}
                        style={[styles.phoneInput, { color: colors.text }]}
                        keyboardType="phone-pad"
                        placeholder="3001234567"
                        placeholderTextColor="#888"
                    />
                </View>
                {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}

                {/* Gender Dropdown */}
                <Text style={[styles.label, { color: colors.text }]}>Gender</Text>
                <View style={[styles.genderContainer, { zIndex: 1000 }]}>
                    <TouchableOpacity
                        style={[styles.dropdownHeader, { backgroundColor: colors.card, borderColor: '#ddd' }]}
                        onPress={() => setGenderOpen(!genderOpen)}
                    >
                        <Text style={{ color: gender ? colors.text : '#888' }}>{gender || "Select Gender"}</Text>
                        <Ionicons name={genderOpen ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
                    </TouchableOpacity>

                    {genderOpen && (
                        <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: '#ddd' }]}>
                            {['Male', 'Female'].map((option, index) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.dropdownItem,
                                        { borderBottomWidth: index === 1 ? 0 : 1, borderBottomColor: '#ddd' }
                                    ]}
                                    onPress={() => {
                                        setGender(option);
                                        setGenderError('');
                                        setGenderOpen(false);
                                    }}
                                >
                                    <Text style={{ color: colors.text }}>{option}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
                {genderError ? <Text style={styles.errorText}>{genderError}</Text> : null}

                {/* Address */}
                <Text style={[styles.label, { color: colors.text }]}>Address</Text>
                <TextInput
                    value={address}
                    onChangeText={(t) => {
                        setAddress(t);
                        if (t) setAddressError('');
                    }}
                    multiline
                    numberOfLines={3}
                    placeholder="Enter your address"
                    placeholderTextColor="#888"
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text, height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                />
                {addressError ? <Text style={styles.errorText}>{addressError}</Text> : null}

                {generalError ? <Text style={[styles.errorText, { textAlign: 'center', marginBottom: 10 }]}>{generalError}</Text> : null}

                <TouchableOpacity
                    style={[styles.updateBtn, { backgroundColor: '#4CAF50', opacity: updating ? 0.7 : 1 }]}
                    onPress={handleUpdate}
                    activeOpacity={0.8}
                    disabled={updating}
                >
                    <Text style={styles.updateBtnText}>{updating ? 'Updating Profile...' : 'Update Profile'}</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backBtn: { marginRight: 15 },
    header: { fontSize: 24, fontWeight: 'bold' },
    form: { paddingBottom: 40, gap: 15 },
    label: { fontSize: 16, marginBottom: 5, fontWeight: '500' },
    input: { height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 15 },
    readOnlyInput: { height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 15, justifyContent: 'center' },
    phoneContainer: { flexDirection: 'row', alignItems: 'center', height: 50, borderRadius: 10, borderWidth: 1, paddingHorizontal: 15 },
    phonePrefix: { fontSize: 16, fontWeight: 'bold', marginRight: 10 },
    verticalDivider: { width: 1, height: '60%', backgroundColor: '#ccc', marginRight: 10 },
    phoneInput: { flex: 1, height: '100%' },
    genderContainer: { zIndex: 10 },
    dropdownHeader: { height: 50, borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15 },
    dropdownList: {
        position: 'absolute', top: 55, left: 0, right: 0,
        backgroundColor: '#fff',
        borderWidth: 1, borderRadius: 10,
        zIndex: 1000, elevation: 5,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4
    },
    dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
    updateBtn: { marginTop: 20, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    updateBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    errorText: { color: 'red', fontSize: 12, marginTop: -10, marginBottom: 5 }
});
