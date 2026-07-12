import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  cancelarPedido,
  enviarMensaje,
  obtenerMensajesPedido,
  cambiarEstadoPedido
} from '../api/pedidosApi';
import { ApiError } from '../api/client';
import { colors } from '../themes/colors';
import { MensajeBurbuja } from '../components/MensajeBurbuja';
import { EstadoBadge } from '../components/estadoBadge';
import { useAuth } from '../auth/AuthContext';
import type { Mensaje } from '../types/gig';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChatPedido'>;

function Separator() {
  return <View style={styles.separator} />;
}

export function ChatPedidoScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();
  const { pedido } = route.params;

  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [estadoActual, setEstadoActual] = useState(pedido.estado);
  const flatListRef = useRef<FlatList>(null);
  const [mostrarModalCancelar, setMostrarModalCancelar] = useState(false);

  const cargarMensajes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await obtenerMensajesPedido(pedido.id);
      setMensajes(data);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudieron cargar los mensajes.',
      );
    } finally {
      setLoading(false);
    }
  }, [pedido.id]);

  useEffect(() => {
    cargarMensajes();
  }, [cargarMensajes]);

  const handleEnviar = async () => {
    if (!texto.trim() || !usuario) return;
    setEnviando(true);
    const textoEnviado = texto.trim();
    setTexto('');
    try {
      const pedidoActualizado = await enviarMensaje(pedido.id, {
        usuario,
        mensaje: textoEnviado,
      });
      setMensajes(pedidoActualizado.mensajes as unknown as Mensaje[]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo enviar.');
      setTexto(textoEnviado); 
    } finally {
      setEnviando(false);
    }
  };

  const handleAceptar = async () => {
  try {
    console.log("Aceptando pedido...");

    const pedidoActualizado = await cambiarEstadoPedido(
      pedido.id,
      'CONFIRMADO'
    );

    console.log(pedidoActualizado);

    setEstadoActual(pedidoActualizado.estado);

    Alert.alert(
      "Pedido aceptado",
      "El pedido fue aceptado correctamente."
    );
  } catch (err) {
    console.log(err);

    Alert.alert(
      "Error",
      err instanceof ApiError
        ? err.message
        : "No se pudo aceptar el pedido."
    );
  }
};

  const handleCancelar = () => {
    setMostrarModalCancelar(true);
  };

  const puedeOpinar =
    usuario?.tipo === 'CLIENTE' &&
    estadoActual.actual?.toUpperCase() === 'ENTREGADO';

  const puedeCancelar =
    estadoActual.actual?.toUpperCase() === 'CONFIRMADO'

  const puedeAceptar =
    usuario?.tipo === 'FREELANCER' &&
    estadoActual.actual?.toUpperCase() === 'PENDIENTE';


  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.bottom + 10}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.gigNombre} numberOfLines={1}>
              {pedido.gig.nombre}
            </Text>
            <EstadoBadge estado={estadoActual} />
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.accionesRow}>
          {puedeCancelar && (
            <Pressable
              style={styles.cancelarBtn}
              onPress={handleCancelar}
              disabled={cancelando}>
          {cancelando ? (
            <ActivityIndicator size="small" color="#F09595" />
          ) : (
            <Text style={styles.cancelarText}>✕ Cancelar pedido</Text>
          )}
          </Pressable>
          )}
          {puedeAceptar && (
            <Pressable 
            style={styles.aceptarBtn}
            onPress={handleAceptar}>
          <Text>Aceptar pedido</Text>
          </Pressable>)}
          {puedeOpinar && (
            <Pressable
              style={styles.opinarBtn}
              onPress={() => navigation.navigate('Opinar', { pedido })}>
              <Text style={styles.opinarText}>★ Dejar opinión</Text>
            </Pressable>
          )}
        </View>

        {/* Mensajes */}
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.textPrimary} />
          </View>
        ) : error && mensajes.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={mensajes}
            keyExtractor={(_, idx) => String(idx)}
            renderItem={({ item }) => (
              <MensajeBurbuja mensaje={item} miId={usuario?.id ?? -1} />
            )}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={Separator}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No hay mensajes aún. ¡Enviá el primero!</Text>
              </View>
            }
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}

        {/* Input */}
        <View style={[styles.inputRow, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={styles.input}
            placeholder="Escribí un mensaje..."
            placeholderTextColor={colors.textMuted}
            value={texto}
            onChangeText={setTexto}
            multiline
            maxLength={500}
            editable={estadoActual.actual?.toUpperCase() !== 'CANCELADO'}
          />
          <Pressable
            style={[
              styles.enviarBtn,
              (!texto.trim() || enviando) && styles.btnDisabled,
            ]}
            onPress={handleEnviar}
            disabled={!texto.trim() || enviando}>
            {enviando ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={styles.enviarIcon}>↑</Text>
            )}
          </Pressable>
        </View>
      </View>
      <Modal
        visible={mostrarModalCancelar}
        transparent
        animationType="fade"
        >
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitulo}>
        Cancelar pedido
      </Text>

      <Text style={styles.modalTexto}>
        ¿Estás seguro de que querés cancelar este pedido?
      </Text>

      <View style={styles.modalBotones}>
        <Pressable
          onPress={() => setMostrarModalCancelar(false)}
        >
          <Text>Volver</Text>
        </Pressable>

        <Pressable
          onPress={async () => {
            setMostrarModalCancelar(false);
            setCancelando(true);

            try {
              const pedidoCancelado = await cancelarPedido(pedido.id);

              setEstadoActual(pedidoCancelado.estado);

              Alert.alert(
                "Éxito",
                "Pedido cancelado correctamente."
              );
            } catch (err) {
              Alert.alert(
                "Error",
                err instanceof ApiError
                  ? err.message
                  : "No se pudo cancelar."
              );
            } finally {
              setCancelando(false);
            }
          }}
        >
          <Text style={{ color: "red" }}>
            Cancelar pedido
          </Text>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  backBtn: {
    paddingRight: 4,
  },
  backText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  gigNombre: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  accionesRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexWrap: 'wrap',
  },
  cancelarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#501313',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  aceptarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0b751bff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  cancelarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F09595',
  },
  opinarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#173404',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  opinarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#97C459',
  },
  btnDisabled: {
    opacity: 0.5,
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
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  separator: {
    height: 10,
  },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14,
    maxHeight: 100,
  },
  enviarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enviarIcon: {
    fontSize: 18,
    color: colors.background,
    fontWeight: '700',
  },
  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},

modalContainer: {
  width: "85%",
  backgroundColor: "#1f1f1f",
  borderRadius: 16,
  padding: 20,
},

modalTitulo: {
  fontSize: 18,
  fontWeight: "700",
  color: "white",
},

modalTexto: {
  marginTop: 10,
  color: "#ccc",
  fontSize: 14,
},

modalBotones: {
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: 20,
  marginTop: 25,
},
});
