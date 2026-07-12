import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { agregarOpinion } from '../api/pedidosApi';
import { ApiError } from '../api/client';
import { colors } from '../themes/colors';
import { RatingStars } from '../components/RatingStars';
import { useAuth } from '../auth/AuthContext';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Opinar'>;

export function OpinarScreen({ route, navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();
  const { pedido } = route.params;

  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEnviar = async () => {
    if (puntuacion === 0) {
      setError('Tenés que seleccionar al menos 1 estrella.');
      return;
    }
    if (!usuario) return;
    setError(null);
    setLoading(true);
    try {
      await agregarOpinion(pedido.id, {
        usuario,
        puntuacion,
        comentario: comentario.trim() || 'Sin comentario.',
      });
      Alert.alert('¡Opinión enviada!', 'Tu reseña quedó publicada en el Gig.', [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'No se pudo enviar la opinión.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav */}
      <View style={styles.navBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Volver</Text>
        </Pressable>
        <Text style={styles.navTitle}>Dejar opinión</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Gig info */}
        <View style={styles.gigCard}>
          <Text style={styles.gigLabel}>Estás reseñando</Text>
          <Text style={styles.gigNombre}>{pedido.gig.nombre}</Text>
          <Text style={styles.paqueteText}>Paquete: {pedido.paquete.nombre}</Text>
        </View>

        {/* Rating */}
        <Text style={styles.sectionTitle}>¿Cuántas estrellas le das?</Text>
        <View style={styles.starsRow}>
          <RatingStars value={puntuacion} onChange={setPuntuacion} size={38} />
        </View>
        {puntuacion > 0 && (
          <Text style={styles.ratingDesc}>
            {['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'][puntuacion]}
          </Text>
        )}

        {/* Comentario */}
        <Text style={styles.sectionTitle}>Comentario (opcional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Contá tu experiencia..."
          placeholderTextColor={colors.textMuted}
          value={comentario}
          onChangeText={setComentario}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{comentario.length}/500</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={[styles.boton, (loading || puntuacion === 0) && styles.botonDisabled]}
          onPress={handleEnviar}
          disabled={loading || puntuacion === 0}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.botonTexto}>Publicar reseña</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
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
  gigCard: {
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
  paqueteText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6,
  },
  starsRow: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  ratingDesc: {
    textAlign: 'center',
    fontSize: 14,
    color: '#F4C542',
    fontWeight: '600',
    marginTop: -6,
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
  charCount: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    marginTop: -8,
  },
  errorText: {
    color: '#F09595',
    fontSize: 13,
    textAlign: 'center',
  },
  boton: {
    backgroundColor: '#F4C542',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  botonDisabled: {
    opacity: 0.4,
  },
  botonTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0d0d0d',
  },
});
