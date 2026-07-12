import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { estadoColorFallback, estadoColors } from '../themes/colors';
import type { EstadoPedido } from '../types/pedido';

type Props = {
  estado: EstadoPedido;
};

export function EstadoBadge({ estado }: Props) {
  const paleta = estadoColors[estado.actual] ?? estadoColorFallback;

  return (
    <View style={[styles.badge, { backgroundColor: paleta.bg }]}>
      <View style={[styles.dot, { backgroundColor: paleta.text }]} />
      <Text style={[styles.text, { color: paleta.text }]} numberOfLines={1}>
        {estado.descripcion}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});