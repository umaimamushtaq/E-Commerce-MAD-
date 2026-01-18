import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { CartProvider } from './Context/CartContext';
import { ThemeProvider } from './Context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <CartProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </CartProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
