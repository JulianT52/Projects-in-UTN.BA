import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { obtenerPedidosDelCliente } from '../api/pedidosApi';
import { ApiError } from '../api/client';
import { colors } from '../themes/colors';
import type { Pedido } from '../types/pedido';
import { PedidoCard } from '../components/pedidoCard';
import { CerrarSesionButton } from '../components/CerrarSesionButton';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MisPedidos'>;

function Separator() {
  return <View style={styles.separator} />;
}

export function MisPedidosScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarPedidos = useCallback(async ({ isRefresh = false } = {}) => {
    if (!usuario) return;
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const data = await obtenerPedidosDelCliente(usuario.id);
      setPedidos(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos conectar con el servidor. Revisá que el backend esté corriendo.',
      );
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  }, [usuario]);

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Mis pedidos</Text>
          <CerrarSesionButton />
        </View>
        <Text style={styles.subtitle}>
          Estado de cada pedido y días de entrega una vez confirmado.
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : pedidos.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Todavía no hiciste ningún pedido.</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('ChatPedido', { pedido: item })}>
              <PedidoCard pedido={item} />
            </Pressable>
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={Separator}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => cargarPedidos({ isRefresh: true })}
              tintColor={colors.textPrimary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    color: '#F09595',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 10,
  },
});