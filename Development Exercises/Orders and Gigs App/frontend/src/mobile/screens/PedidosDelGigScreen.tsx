import React, { useCallback, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { obtenerPedidosDelGig } from '../api/pedidosApi';
import { obtenerGigs } from '../api/gigsApi';
import { ApiError } from '../api/client';
import { colors } from '../themes/colors';
import type { Pedido } from '../types/pedido';
import { PedidoGigCard } from '../components/PedidoGigCard';
import { CerrarSesionButton } from '../components/CerrarSesionButton';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PedidosDelGig'>;

function Separator() {
  return <View style={styles.separator} />;
}

export function PedidosDelGigScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cantidadGigs, setCantidadGigs] = useState(0);

  const cargarPedidos = useCallback(async ({ isRefresh = false } = {}) => {
    if (!usuario) return;

    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);

    try {
      const gigs = await obtenerGigs();
      const misGigs = gigs.filter((gig) => Number(gig.vendedor?.id) === Number(usuario.id));
      setCantidadGigs(misGigs.length);

      const pedidosPorGig = await Promise.all(
        misGigs.map((gig) => obtenerPedidosDelGig(gig.id).catch(() => [] as Pedido[])),
      );

      const pedidosOrdenados = pedidosPorGig
        .flat()
        .sort((a, b) => Number(b.id) - Number(a.id));

      setPedidos(pedidosOrdenados);
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

  useFocusEffect(
    useCallback(() => {
      cargarPedidos();
    }, [cargarPedidos]),
  );

  const emptyMessage =
    cantidadGigs === 0
      ? 'Todavía no publicaste ningún Gig.'
      : 'Tus Gigs todavía no tienen pedidos.';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Pedidos de mis Gigs</Text>
          <CerrarSesionButton />
        </View>
        <Text style={styles.subtitle}>
          Estado y tiempo restante de los pedidos asociados a tus servicios publicados.
        </Text>
        <Pressable style={styles.crearGigBtn} onPress={() => navigation.navigate('CrearGig')}>
          <Text style={styles.crearGigBtnText}>＋ Crear nuevo Gig</Text>
        </Pressable>
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
          <Text style={styles.emptyText}>{emptyMessage}</Text>
          <Pressable style={styles.emptyCrearBtn} onPress={() => navigation.navigate('CrearGig')}>
            <Text style={styles.emptyCrearBtnText}>Publicar un Gig</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('ChatPedido', { pedido: item })}>
              <PedidoGigCard pedido={item} />
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
  crearGigBtn: {
    marginTop: 14,
    backgroundColor: colors.textPrimary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  crearGigBtnText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyCrearBtn: {
    marginTop: 16,
    backgroundColor: colors.textPrimary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  emptyCrearBtnText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  separator: {
    height: 10,
  },
});
