import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { obtenerGigPorId } from '../api/gigsApi';
import { ApiError } from '../api/client';
import { colors } from '../themes/colors';
import { PaqueteCard } from '../components/PaqueteCard';
import { RatingStars } from '../components/RatingStars';
import type { Gig, Opinion } from '../types/gig';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'DetalleGig'>;

function OpinionItem({ opinion }: { opinion: Opinion }) {
  const nombre = [opinion.cliente?.nombre, opinion.cliente?.apellido].filter(Boolean).join(' ') || 'Cliente';
  const fecha = opinion.fecha
    ? new Date(opinion.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return (
    <View style={stylesOpinion.card}>
      <View style={stylesOpinion.row}>
        <Text style={stylesOpinion.nombre}>{nombre}</Text>
        {fecha ? <Text style={stylesOpinion.fecha}>{fecha}</Text> : null}
      </View>
      <RatingStars value={opinion.puntuacion} size={16} />
      {opinion.comentario ? (
        <Text style={stylesOpinion.comentario}>{opinion.comentario}</Text>
      ) : null}
    </View>
  );
}

const stylesOpinion = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 10,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombre: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  fecha: {
    fontSize: 11,
    color: colors.textMuted,
  },
  comentario: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export function DetalleGigScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  // Usamos el gig del parámetro como dato inicial y recargamos para tener opiniones frescas
  const gigInicial = route.params.gig;
  const [gig, setGig] = useState<Gig>(gigInicial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerGigPorId(gigInicial.id);
      setGig(data);
    } catch (err) {
      // Si falla, igual mostramos el gig inicial
      setError(err instanceof ApiError ? err.message : null);
    } finally {
      setLoading(false);
    }
  }, [gigInicial.id]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const puntajePromedio =
    gig.opiniones?.length > 0
      ? gig.opiniones.reduce((a, o) => a + o.puntuacion, 0) / gig.opiniones.length
      : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Back button */}
      <View style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>← </Text>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Hero placeholder */}
          <View style={[styles.hero, { backgroundColor: heroColor(gig.id) }]}>
            <Text style={styles.heroIcon}>{categoryIcon(gig.categoria?.nombre)}</Text>
          </View>

          <View style={styles.body}>
            {/* Info principal */}
            <Text style={styles.categoria}>{gig.categoria?.nombre}</Text>
            <Text style={styles.nombre}>{gig.nombre}</Text>

            <View style={styles.vendedorRow}>
              <Text style={styles.vendedorLabel}>Por </Text>
              <Text style={styles.vendedorNombre}>
                {[gig.vendedor?.nombre, gig.vendedor?.apellido].filter(Boolean).join(' ')}
              </Text>
            </View>

            {puntajePromedio !== null && (
              <View style={styles.ratingRow}>
                <RatingStars value={Math.round(puntajePromedio)} size={18} />
                <Text style={styles.ratingText}>
                  {puntajePromedio.toFixed(1)} · {gig.opiniones.length}{' '}
                  {gig.opiniones.length === 1 ? 'reseña' : 'reseñas'}
                </Text>
              </View>
            )}

            <Text style={styles.descripcion}>{gig.descripcion}</Text>

            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Paquetes */}
            <Text style={styles.sectionTitle}>Paquetes disponibles</Text>
            <View style={styles.paquetesCol}>
              {(gig.paquetes ?? []).map((paquete, idx) => (
                <PaqueteCard
                  key={idx}
                  paquete={paquete}
                  onContratar={() =>
                    navigation.navigate('CrearPedido', { gig, paquete })
                  }
                />
              ))}
            </View>

            {/* Opiniones */}
            <Text style={styles.sectionTitle}>
              Reseñas{' '}
              {gig.opiniones?.length > 0 ? `(${gig.opiniones.length})` : ''}
            </Text>
            {!gig.opiniones || gig.opiniones.length === 0 ? (
              <Text style={styles.emptyText}>Este gig aún no tiene reseñas.</Text>
            ) : (
              <View style={styles.opinionesCol}>
                {gig.opiniones.map((op, idx) => (
                  <OpinionItem key={idx} opinion={op} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function heroColor(id: number) {
  const opts = ['#0d1f2d', '#0d2d1f', '#1f0d2d', '#2d1f0d', '#0d2d2d'];
  return opts[id % opts.length];
}

function categoryIcon(cat?: string) {
  if (!cat) return '🎯';
  if (cat.toLowerCase().includes('diseño')) return '🎨';
  if (cat.toLowerCase().includes('web') || cat.toLowerCase().includes('desarrollo')) return '💻';
  if (cat.toLowerCase().includes('marketing')) return '📣';
  return '✨';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  backText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    paddingBottom: 40,
  },
  hero: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIcon: {
    fontSize: 60,
  },
  body: {
    padding: 20,
    gap: 10,
  },
  categoria: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7eb3ff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nombre: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 28,
  },
  vendedorRow: {
    flexDirection: 'row',
  },
  vendedorLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  vendedorNombre: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  descripcion: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginTop: 4,
  },
  errorText: {
    color: '#F09595',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  paquetesCol: {
    gap: 10,
  },
  opinionesCol: {
    gap: 10,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontStyle: 'italic',
  },
});
