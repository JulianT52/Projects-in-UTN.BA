import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../themes/colors';
import type { Gig } from '../types/gig';

type Props = {
  gig: Gig;
  onPress: () => void;
};

function calcularPuntajePromedio(opiniones: Gig['opiniones']): number | null {
  if (!opiniones || opiniones.length === 0) return null;
  const suma = opiniones.reduce((acc, o) => acc + o.puntuacion, 0);
  return suma / opiniones.length;
}

function precioDesde(paquetes: Gig['paquetes']): number | null {
  if (!paquetes || paquetes.length === 0) return null;
  return Math.min(...paquetes.map((p) => p.precio));
}

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export function GigCard({ gig, onPress }: Props) {
  const puntaje = calcularPuntajePromedio(gig.opiniones);
  const desde = precioDesde(gig.paquetes);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}>
      {/* Imagen placeholder colorida basada en id */}
      <View style={[styles.imagePlaceholder, { backgroundColor: placeholderColor(gig.id) }]}>
        <Text style={styles.imagePlaceholderIcon}>{categoryIcon(gig.categoria?.nombre)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.categoria}>{gig.categoria?.nombre ?? 'General'}</Text>
        <Text style={styles.nombre} numberOfLines={2}>
          {gig.nombre}
        </Text>
        <Text style={styles.vendedor} numberOfLines={1}>
          {[gig.vendedor?.nombre, gig.vendedor?.apellido].filter(Boolean).join(' ')}
        </Text>

        <View style={styles.footer}>
          {puntaje !== null ? (
            <View style={styles.ratingRow}>
              <Text style={styles.star}>★</Text>
              <Text style={styles.ratingText}>
                {puntaje.toFixed(1)}
                <Text style={styles.reviewCount}> ({gig.opiniones.length})</Text>
              </Text>
            </View>
          ) : (
            <Text style={styles.sinReviews}>Sin reseñas aún</Text>
          )}

          {desde !== null && (
            <Text style={styles.precio}>desde {formatoMoneda.format(desde)}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function placeholderColor(id: number) {
  const palette = ['#1a2a3a', '#1a3a2a', '#2a1a3a', '#3a2a1a', '#1a3a3a'];
  return palette[id % palette.length];
}

function categoryIcon(categoria?: string) {
  if (!categoria) return '🎯';
  if (categoria.toLowerCase().includes('diseño')) return '🎨';
  if (categoria.toLowerCase().includes('web') || categoria.toLowerCase().includes('desarrollo')) return '💻';
  if (categoria.toLowerCase().includes('marketing')) return '📣';
  return '✨';
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.8,
  },
  imagePlaceholder: {
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderIcon: {
    fontSize: 40,
  },
  content: {
    padding: 14,
    gap: 4,
  },
  categoria: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7eb3ff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nombre: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    lineHeight: 19,
  },
  vendedor: {
    fontSize: 12,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  star: {
    color: '#F4C542',
    fontSize: 13,
  },
  ratingText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  reviewCount: {
    color: colors.textMuted,
    fontWeight: '400',
  },
  sinReviews: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  precio: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5DCAA5',
  },
});
