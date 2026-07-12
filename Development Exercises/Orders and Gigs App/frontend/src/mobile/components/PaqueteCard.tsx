import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../themes/colors';
import type { Paquete } from '../types/gig';

type Props = {
  paquete: Paquete;
  onContratar?: () => void;
  seleccionado?: boolean;
};

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export function PaqueteCard({ paquete, onContratar, seleccionado }: Props) {
  return (
    <View style={[styles.card, seleccionado && styles.cardSeleccionado]}>
      <View style={styles.header}>
        <Text style={styles.nombre}>{paquete.nombre}</Text>
        <Text style={styles.precio}>{formatoMoneda.format(paquete.precio)}</Text>
      </View>

      <Text style={styles.dias}>
        ⏱ {paquete.diasDeEntrega} {paquete.diasDeEntrega === 1 ? 'día' : 'días'} de entrega
      </Text>

      {onContratar && (
        <Pressable
          style={({ pressed }) => [styles.boton, pressed && styles.botonPressed]}
          onPress={onContratar}>
          <Text style={styles.botonTexto}>Contratar este paquete</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardSeleccionado: {
    borderColor: '#5DCAA5',
    backgroundColor: '#04342C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nombre: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  precio: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5DCAA5',
  },
  dias: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  boton: {
    backgroundColor: colors.textPrimary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 2,
  },
  botonPressed: {
    opacity: 0.8,
  },
  botonTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.background,
  },
});
