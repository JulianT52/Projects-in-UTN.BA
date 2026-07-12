import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../themes/colors';
import type { Pedido } from '../types/pedido';
import { EstadoBadge } from './estadoBadge';

type Props = {
  pedido: Pedido;
};

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export function PedidoCard({ pedido }: Props) {
  const estaConfirmado =
    pedido.estado.actual?.toUpperCase() === 'CONFIRMADO' && pedido.diasEntregaEsperados !== null;

  return (
    <View style={styles.card}>
      <Text style={styles.gigName} numberOfLines={2}>
        {pedido.gig.nombre}
      </Text>

      <EstadoBadge estado={pedido.estado} />

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{pedido.paquete.nombre}</Text>
        <Text style={styles.metaText}> · </Text>
        <Text style={styles.metaText}>{formatoMoneda.format(pedido.total)}</Text>
      </View>

      <View style={styles.deliveryBlock}>
        {estaConfirmado ? (
          <>
            <Text style={styles.deliveryLabel}>Entrega estimada</Text>
            <Text style={styles.deliveryValue}>{pedido.entregarEn}</Text>
          </>
        ) : (
          <Text style={styles.deliveryHint}>
            Todavía sin fecha de entrega: se calcula cuando el vendedor confirma el pedido.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  gigName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  deliveryBlock: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
  },
  deliveryLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  deliveryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  deliveryHint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
});