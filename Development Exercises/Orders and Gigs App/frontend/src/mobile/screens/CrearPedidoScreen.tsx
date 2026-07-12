import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { crearPedido } from '../api/pedidosApi';
import { ApiError } from '../api/client';
import { colors } from '../themes/colors';
import { PaqueteCard } from '../components/PaqueteCard';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation/types';
import type { Pedido } from '../types/pedido';

type Props = NativeStackScreenProps<RootStackParamList, 'CrearPedido'>;

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

export function CrearPedidoScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();
  const { gig, paquete } = route.params;

  const [requerimientos, setRequerimientos] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidoCreado, setPedidoCreado] = useState<Pedido | null>(null);

  const handleConfirmar = async () => {
    if (!usuario || pedidoCreado) return;
    setError(null);
    setLoading(true);
    try {
      const nuevoPedido = await crearPedido({
        cliente: usuario,
        gig,
        paquete: {
          nombre: paquete.nombre,
          precio: paquete.precio,
          diasDeEntrega: paquete.diasDeEntrega,
        },
        total: paquete.precio,
        requerimientos: requerimientos.trim() || undefined,
      });

      setPedidoCreado(nuevoPedido);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'No se pudo crear el pedido.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}> 
      {/* Nav */}
      <View style={styles.navBar}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.navTitle}>Confirmar pedido</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {pedidoCreado && (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>✅ Pedido creado correctamente</Text>
            <Text style={styles.successText}>
              Tu pedido fue enviado al freelancer. Ahora aparece en “Mis pedidos”.
            </Text>
            <View style={styles.successDetailBox}>
              <Text style={styles.successDetail}>Pedido: #{pedidoCreado.id}</Text>
              <Text style={styles.successDetail}>Estado: {pedidoCreado.estado.actual}</Text>
              <Text style={styles.successDetail}>Paquete: {pedidoCreado.paquete.nombre}</Text>
              <Text style={styles.successDetail}>Total: {formatoMoneda.format(pedidoCreado.total)}</Text>
              <Text style={styles.successDetail}>Entrega estimada: {pedidoCreado.entregarEn}</Text>
            </View>
            <Pressable
              style={styles.successButton}
              onPress={() => navigation.navigate('MisPedidos')}>
              <Text style={styles.successButtonText}>Ver mis pedidos</Text>
            </Pressable>
          </View>
        )}

        {/* Resumen del Gig */}
        <View style={styles.gigResumen}>
          <Text style={styles.gigLabel}>Gig seleccionado</Text>
          <Text style={styles.gigNombre}>{gig.nombre}</Text>
          <Text style={styles.gigVendedor}>
            Por {[gig.vendedor?.nombre, gig.vendedor?.apellido].filter(Boolean).join(' ')}
          </Text>
        </View>

        {/* Paquete */}
        <Text style={styles.sectionTitle}>Paquete</Text>
        <PaqueteCard paquete={paquete} seleccionado />

        {/* Requerimientos */}
        <Text style={styles.sectionTitle}>Requerimientos particulares</Text>
        <TextInput
          style={[styles.textArea, pedidoCreado && styles.inputDisabled]}
          placeholder="Describí lo que necesitás (opcional)..."
          placeholderTextColor={colors.textMuted}
          value={requerimientos}
          onChangeText={(value) => {
            setRequerimientos(value);
            setPedidoCreado(null);
          }}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          editable={!pedidoCreado}
        />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total a pagar</Text>
          <Text style={styles.totalValue}>{formatoMoneda.format(paquete.precio)}</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        
        <Pressable
          style={[styles.boton, (loading || !!pedidoCreado) && styles.botonDisabled]}
          onPress={handleConfirmar}
          disabled={loading || !!pedidoCreado}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : pedidoCreado ? (
            <Text style={styles.botonTexto}>Pedido ya creado</Text>
          ) : (
            <Text style={styles.botonTexto}>Confirmar pedido</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {},
  backText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scroll: {
    padding: 20,
    gap: 14,
    paddingBottom: 40,
  },
  successBox: {
    backgroundColor: '#04342C',
    borderColor: '#5DCAA5',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  successTitle: {
    color: '#5DCAA5',
    fontSize: 16,
    fontWeight: '800',
  },
  successText: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 18,
  },
  successDetailBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 10,
    padding: 10,
    gap: 3,
  },
  successDetail: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  successButton: {
    marginTop: 4,
    backgroundColor: '#5DCAA5',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  successButtonText: {
    color: colors.background,
    fontSize: 13,
    fontWeight: '800',
  },
  gigResumen: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  gigLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#7eb3ff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gigNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  gigVendedor: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 14,
    padding: 14,
    minHeight: 110,
  },
  inputDisabled: {
    opacity: 0.55,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5DCAA5',
  },
  errorText: {
    color: '#F09595',
    fontSize: 13,
    textAlign: 'center',
  },
  boton: {
    backgroundColor: colors.textPrimary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  botonDisabled: {
    opacity: 0.6,
  },
  botonTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
  },
});
