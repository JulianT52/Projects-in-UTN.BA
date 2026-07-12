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

export function PedidoGigCard({ pedido }: Props) {
  const estaConfirmado =
    pedido.estado.actual?.toUpperCase() === 'CONFIRMADO' && pedido.diasEntregaEsperados !== null;

  const nombreCliente = [pedido.cliente?.nombre, pedido.cliente?.apellido].filter(Boolean).join(' ');

  return (
    <View style={styles.card}>
      <Text style={styles.clienteName} numberOfLines={1}>
        {nombreCliente || 'Cliente'}
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
            <Text style={styles.deliveryLabel}>Tiempo restante para la entrega</Text>
            <Text style={styles.deliveryValue}>{pedido.entregarEn}</Text>
          </>
        ) : (
          <Text style={styles.deliveryHint}>
            Todavía no hay tiempo de entrega: se calcula cuando confirmes el pedido.
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
  clienteName: {
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