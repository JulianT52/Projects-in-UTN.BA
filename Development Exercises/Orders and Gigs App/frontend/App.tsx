import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/mobile/auth/AuthContext';
import type { RootStackParamList } from './src/mobile/navigation/types';
import { LoginScreen } from './src/mobile/screens/LoginScreen';
import { ExplorarGigsScreen } from './src/mobile/screens/ExplorarGigsScreen';
import { DetalleGigScreen } from './src/mobile/screens/DetalleGigScreen';
import { CrearPedidoScreen } from './src/mobile/screens/CrearPedidoScreen';
import { MisPedidosScreen } from './src/mobile/screens/MisPedidosScreen';
import { ChatPedidoScreen } from './src/mobile/screens/ChatPedidoScreen';
import { OpinarScreen } from './src/mobile/screens/OpinarScreen';
import { PedidosDelGigScreen } from './src/mobile/screens/PedidosDelGigScreen';
import { CrearGigScreen } from './src/mobile/screens/CrearGigScreen';

import { colors } from './src/mobile/themes/colors';

const Stack = createNativeStackNavigator<RootStackParamList>();

const headerOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.textPrimary,
  headerTitleStyle: { fontWeight: '600' as const },
  headerShadowVisible: false,
};

function AppNavigator() {
  const { usuario } = useAuth();

  if (!usuario) {
    return (
      <Stack.Navigator screenOptions={headerOptions}>
        <Stack.Screen name="Login" component={LoginScreen} />
      </Stack.Navigator>
    );
  }

  if (usuario.tipo === 'CLIENTE') {
    return (
      <Stack.Navigator
        initialRouteName="ExplorarGigs"
        screenOptions={headerOptions}>
        <Stack.Screen name="ExplorarGigs" component={ExplorarGigsScreen} options={{ title: 'Explorar' }} />
        <Stack.Screen name="DetalleGig" component={DetalleGigScreen} options={{ title: 'Detalle' }} />
        <Stack.Screen name="CrearPedido" component={CrearPedidoScreen} options={{ title: 'Nuevo Pedido' }} />
        <Stack.Screen name="MisPedidos" component={MisPedidosScreen} options={{ title: 'Mis Pedidos' }} />
        <Stack.Screen name="ChatPedido" component={ChatPedidoScreen} options={{ title: 'Chat' }} />
        <Stack.Screen name="Opinar" component={OpinarScreen} options={{ title: 'Dar Opinión' }} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="PedidosDelGig"
      screenOptions={headerOptions}>
      <Stack.Screen name="PedidosDelGig" component={PedidosDelGigScreen} options={{ title: 'Mis Gigs' }} />
      <Stack.Screen name="ChatPedido" component={ChatPedidoScreen} options={{ title: 'Chat' }} />
      <Stack.Screen name="CrearGig" component={CrearGigScreen} options={{ title: 'Crear Gig' }} />
    </Stack.Navigator>
  );
}

function App() {
  const isWeb = Platform.OS === 'web';

  return (
    <SafeAreaProvider>
      <View style={isWeb ? styles.webViewport : styles.nativeViewport}>
        <View style={isWeb ? styles.webPhoneFrame : styles.nativePhoneFrame}>
          <StatusBar style="light" backgroundColor="#0d0d0d" />
          <AuthProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AuthProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  nativeViewport: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nativePhoneFrame: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  webViewport: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b1b1f',
  },
  webPhoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
});

export default App;
