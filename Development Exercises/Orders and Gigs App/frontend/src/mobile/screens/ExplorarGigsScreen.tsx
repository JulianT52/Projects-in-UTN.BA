import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { obtenerGigs } from '../api/gigsApi';
import { ApiError } from '../api/client';
import { colors } from '../themes/colors';
import { GigCard } from '../components/GigCard';
import type { Gig, OrdenGig } from '../types/gig';
import { CATEGORIAS } from '../types/gig';
import type { RootStackParamList } from '../navigation/types';
import { CerrarSesionButton } from '../components/CerrarSesionButton';

type Props = NativeStackScreenProps<RootStackParamList, 'ExplorarGigs'>;

function Separator() {
  return <View style={styles.separator} />;
}

const ORDENES: { label: string; value: OrdenGig }[] = [
  { label: 'Fecha', value: 'fechaPublicacion' },
  { label: 'Precio', value: 'precio' },
  { label: 'Puntaje', value: 'puntaje' },
];

export function ExplorarGigsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const [orden, setOrden] = useState<OrdenGig>('fechaPublicacion');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cargar = useCallback(
    async ({ isRefresh = false, q = query, catId = categoriaId, ord = orden } = {}) => {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      try {
        const data = await obtenerGigs({ q: q || undefined, categoriaId: catId, orden: ord });
        setGigs(data);
      } catch (err) {
        setError(
          err instanceof ApiError
            ? err.message
            : 'No se pudo conectar con el servidor.',
        );
      } finally {
        isRefresh ? setRefreshing(false) : setLoading(false);
      }
    },
    [query, categoriaId, orden],
  );

  useFocusEffect(
    useCallback(() => {
      cargar();
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }, [cargar]),
  );

  const onChangeQuery = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      cargar({ q: text });
    }, 400);
  };

  const onChangeCategoria = (id?: number) => {
    setCategoriaId(id);
    cargar({ catId: id });
  };

  const onChangeOrden = (ord: OrdenGig) => {
    setOrden(ord);
    cargar({ ord });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Explorar Gigs</Text>
          <View style={styles.headerActions}>
            <Pressable
              style={styles.pedidosBtn}
              onPress={() => navigation.navigate('MisPedidos')}>
              <Text style={styles.pedidosBtnText}>📦 Mis pedidos</Text>
            </Pressable>
            <CerrarSesionButton />
          </View>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar servicios..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={onChangeQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => onChangeQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* Chips de categoría */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriaRow}>
          <Pressable
            style={[styles.chip, !categoriaId && styles.chipActive]}
            onPress={() => onChangeCategoria(undefined)}>
            <Text style={[styles.chipText, !categoriaId && styles.chipTextActive]}>Todas</Text>
          </Pressable>
          {CATEGORIAS.map((cat) => (
            <Pressable
              key={cat.id}
              style={[styles.chip, categoriaId === cat.id && styles.chipActive]}
              onPress={() => onChangeCategoria(categoriaId === cat.id ? undefined : cat.id)}>
              <Text
                style={[styles.chipText, categoriaId === cat.id && styles.chipTextActive]}>
                {cat.nombre}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Selector de orden */}
        <View style={styles.ordenRow}>
          <Text style={styles.ordenLabel}>Ordenar por</Text>
          <View style={styles.ordenChips}>
            {ORDENES.map((o) => (
              <Pressable
                key={o.value}
                style={[styles.ordenChip, orden === o.value && styles.ordenChipActive]}
                onPress={() => onChangeOrden(o.value)}>
                <Text
                  style={[styles.ordenChipText, orden === o.value && styles.ordenChipTextActive]}>
                  {o.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {/* Lista */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : gigs.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyText}>No encontramos gigs con ese criterio.</Text>
        </View>
      ) : (
        <FlatList
          data={gigs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <GigCard gig={item} onPress={() => navigation.navigate('DetalleGig', { gig: item })} />
          )}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={Separator}
          onRefresh={() => cargar({ isRefresh: true })}
          refreshing={refreshing}
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
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pedidosBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pedidosBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 11,
  },
  clearIcon: {
    fontSize: 14,
    color: colors.textMuted,
    padding: 4,
  },
  categoriaRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chip: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.background,
  },
  ordenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  ordenLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  ordenChips: {
    flexDirection: 'row',
    gap: 6,
  },
  ordenChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: colors.surfaceAlt,
  },
  ordenChipActive: {
    backgroundColor: '#1a3d6b',
  },
  ordenChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  ordenChipTextActive: {
    color: '#7eb3ff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
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
    padding: 16,
    paddingTop: 8,
  },
  separator: {
    height: 12,
  },
});
