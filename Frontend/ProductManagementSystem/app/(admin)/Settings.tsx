import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../Context/CartContext';
import { useTheme } from '../Context/ThemeContext';
import { DarkTheme, LightTheme } from '../Theme/Colors';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const colors = theme === 'light' ? LightTheme : DarkTheme;
  const { clearCart } = useCart();

  const handleLogout = async () => {
    await clearCart();
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    router.replace('/');
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <Text style={[styles.header, { color: colors.text }]}>
        Settings
      </Text>

      {/* Theme Row */}
      <View style={styles.row}>
        <Text style={[styles.text, { color: colors.text }]}>Theme</Text>
        <Switch
          value={theme === 'dark'}
          onValueChange={toggleTheme}
          trackColor={{ false: '#4CAF50', true: '#4CAF50' }}
          thumbColor="#ffffff"
        />
      </View>

      {/* Profile Link */}
      <TouchableOpacity onPress={() => router.push('/Profile')} style={styles.row}>
        <Text style={[styles.text, { color: colors.text }]}>Profile</Text>
        <Text style={{ color: colors.text, fontSize: 18 }}>›</Text>
      </TouchableOpacity>


      {/* Change Password Link */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push('/ChangePassword')}
      >
        <Text style={[styles.text, { color: colors.text }]}>Change Password</Text>
        <Text style={{ color: colors.text, fontSize: 18 }}>›</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Logout */}
      <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 30 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  text: { fontSize: 18 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 20 },
  dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  dropdownTitle: { fontSize: 18 },
  dropdownContent: { paddingVertical: 10, gap: 12 },
  infoLabel: { fontSize: 16 }, // display only
  logoutRow: { paddingVertical: 14 },
  logoutText: { fontSize: 18, color: '#E53935', fontWeight: 'bold' },

})
