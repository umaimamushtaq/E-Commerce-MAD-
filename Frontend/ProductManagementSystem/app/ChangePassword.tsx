import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from './Context/ThemeContext';
import { Api } from './Services/Api';
import { DarkTheme, LightTheme } from './Theme/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePassword() {
    const { theme } = useTheme();
    const colors = theme === 'light' ? LightTheme : DarkTheme;

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [oldPasswordError, setOldPasswordError] = useState('');
    const [newPasswordError, setNewPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');

    const handleChangePassword = async () => {
        let valid = true;

        setOldPasswordError('');
        setNewPasswordError('');
        setConfirmPasswordError('');

        if (!oldPassword.trim()) {
            setOldPasswordError('Old password is required');
            valid = false;
        }

        if (!newPassword.trim()) {
            setNewPasswordError('New password is required');
            valid = false;
        } else if (newPassword.length < 8) {
            setNewPasswordError('Password must be at least 8 characters');
            valid = false;
        }

        if (!confirmPassword.trim()) {
            setConfirmPasswordError('Confirm password is required');
            valid = false;
        } else if (newPassword !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            valid = false;
        }

        if (!valid) return;

        try {
            await Api.post(
                '/User/ChangePassword',
                {
                    OldPassword: oldPassword,
                    NewPassword: newPassword,
                }
            );

            // Success
            router.back();

        } catch (error: any) {
            const message =
                error.response?.data || 'Failed to change password';

            // Show backend error inline
            if (message.toLowerCase().includes('old')) {
                setOldPasswordError(message);
            } else {
                setConfirmPasswordError(message);
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>

            {/* Header with Back Button */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.header, { color: colors.text }]}>Change Password</Text>
            </View>

            <View style={styles.form}>
                <Text style={[styles.label, { color: colors.text }]}>Old Password</Text>
                <TextInput
                    value={oldPassword}
                    onChangeText={(text) => {
                        setOldPassword(text);
                        setOldPasswordError('');
                    }}
                    secureTextEntry
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                />
                {oldPasswordError ? (
                    <Text style={styles.errorField}>{oldPasswordError}</Text>
                ) : null}

                <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
                <TextInput
                    value={newPassword}
                    onChangeText={(text) => {
                        setNewPassword(text);
                        setNewPasswordError('');
                    }}
                    secureTextEntry
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                />
                {newPasswordError ? (
                    <Text style={styles.errorField}>{newPasswordError}</Text>
                ) : null}

                <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
                <TextInput
                    value={confirmPassword}
                    onChangeText={(text) => {
                        setConfirmPassword(text);
                        setConfirmPasswordError('');
                    }}
                    secureTextEntry
                    style={[styles.input, { backgroundColor: colors.card, color: colors.text }]}
                />
                {confirmPasswordError ? (
                    <Text style={styles.errorField}>{confirmPasswordError}</Text>
                ) : null}

                <TouchableOpacity
                    style={[styles.changeBtn, { backgroundColor: '#4CAF50' }]}
                    onPress={handleChangePassword}
                    activeOpacity={0.8}
                >
                    <Text style={styles.changeBtnText}>Update Password</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    backBtn: { marginRight: 15 },
    header: { fontSize: 24, fontWeight: 'bold' },
    form: { gap: 15 },
    label: { fontSize: 16, marginBottom: 5 },
    input: { height: 50, borderRadius: 10, borderWidth: 1, borderColor: '#ccc', paddingHorizontal: 15 },
    changeBtn: { marginTop: 20, paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
    changeBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    errorField: { color: 'red', fontSize: 12, marginTop: -10, marginBottom: 5, marginLeft: 5 }
});
