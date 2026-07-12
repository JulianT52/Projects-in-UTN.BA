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
import { crearGig } from '../api/gigsApi';
import { ApiError } from '../api/client';
import { colors } from '../themes/colors';
import { useAuth } from '../auth/AuthContext';
import { CATEGORIAS } from '../types/gig';
import type { Gig, Paquete } from '../types/gig';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CrearGig'>;

type PaqueteForm = Omit<Paquete, 'id'> & { _key: number };

let keyCounter = 0;
const nuevoPaquete = (): PaqueteForm => ({
  _key: keyCounter++,
  nombre: '',
  precio: 0,
  diasDeEntrega: 1,
});

export function CrearGigScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { usuario } = useAuth();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<number>(CATEGORIAS[0].id);
  const [paquetes, setPaquetes] = useState<PaqueteForm[]>([nuevoPaquete()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gigCreado, setGigCreado] = useState<Gig | null>(null);

  const agregarPaquete = () => {
    if (paquetes.length >= 3) return;
    setPaquetes((prev) => [...prev, nuevoPaquete()]);
  };

  const eliminarPaquete = (key: number) => {
    if (paquetes.length <= 1) return;
    setPaquetes((prev) => prev.filter((p) => p._key !== key));
  };

  const actualizarPaquete = (key: number, campo: keyof Omit<PaqueteForm, '_key'>, valor: string) => {
    setGigCreado(null);
    setPaquetes((prev) =>
      prev.map((p) => {
        if (p._key !== key) return p;
        if (campo === 'precio' || campo === 'diasDeEntrega') {
          const num = parseInt(valor, 10);
          return { ...p, [campo]: isNaN(num) ? 0 : num };
        }
        return { ...p, [campo]: valor };
      }),
    );
  };

  const limpiarFormulario = () => {
    setNombre('');
    setDescripcion('');
    setCategoriaId(CATEGORIAS[0].id);
    setPaquetes([nuevoPaquete()]);
    setError(null);
    setGigCreado(null);
  };

  const handlePublicar = async () => {
    if (gigCreado) return;
    if (!nombre.trim()) { setError('El nombre del Gig es obligatorio.'); return; }
    if (!descripcion.trim()) { setError('La descripción es obligatoria.'); return; }
    if (paquetes.some((p) => !p.nombre.trim())) { setError('Todos los paquetes deben tener nombre.'); return; }
    if (paquetes.some((p) => p.precio <= 0)) { setError('El precio de cada paquete debe ser mayor a 0.'); return; }
    if (paquetes.some((p) => p.diasDeEntrega <= 0)) { setError('Los días de entrega deben ser mayor a 0.'); return; }
    if (!usuario) return;

    setError(null);
    setGigCreado(null);
    setLoading(true);
    try {
      const categoriaSeleccionada = CATEGORIAS.find((cat) => cat.id === categoriaId) ?? CATEGORIAS[0];

      const nuevoGig = await crearGig({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        imagen: 'https://placehold.co/800x450/png?text=AI+Do+It',
        categoria: categoriaSeleccionada,
        vendedor: {
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.apellido,
          email: usuario.email,
        },
        paquetes: paquetes.map(({ _key, ...rest }) => rest),
      });

      setGigCreado(nuevoGig);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear el Gig.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Nav */}
      <View style={styles.navBar}>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Cancelar</Text>
        </Pressable>
        <Text style={styles.navTitle}>Publicar Gig</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {gigCreado && (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>✅ Gig publicado correctamente</Text>
            <Text style={styles.successText}>
              Tu Gig ya está disponible para que lo encuentren los clientes.
            </Text>
            <View style={styles.successDetailBox}>
              <Text style={styles.successDetail}>ID: #{gigCreado.id}</Text>
              <Text style={styles.successDetail}>Nombre: {gigCreado.nombre}</Text>
              <Text style={styles.successDetail}>Categoría: {gigCreado.categoria.nombre}</Text>
              <Text style={styles.successDetail}>Paquetes: {gigCreado.paquetes.length}</Text>
            </View>
            <View style={styles.successActions}>
              <Pressable style={styles.successButtonPrimary} onPress={() => navigation.goBack()}>
                <Text style={styles.successButtonPrimaryText}>Volver a mis Gigs</Text>
              </Pressable>
              <Pressable style={styles.successButtonSecondary} onPress={limpiarFormulario}>
                <Text style={styles.successButtonSecondaryText}>Crear otro</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Info básica */}
        <Text style={styles.sectionTitle}>Información del Gig</Text>
        <TextInput
          style={styles.input}
          placeholder="Título del Gig (ej: Diseño de logo profesional)"
          placeholderTextColor={colors.textMuted}
          value={nombre}
          onChangeText={(value) => { setNombre(value); setGigCreado(null); }}
          maxLength={80}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción detallada del servicio..."
          placeholderTextColor={colors.textMuted}
          value={descripcion}
          onChangeText={(value) => { setDescripcion(value); setGigCreado(null); }}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />

        {/* Categoría */}
        <Text style={styles.sectionTitle}>Categoría</Text>
        <View style={styles.categoriasRow}>
          {CATEGORIAS.map((cat) => (
            <Pressable
              key={cat.id}
              style={[styles.catChip, categoriaId === cat.id && styles.catChipActive]}
              onPress={() => { setCategoriaId(cat.id); setGigCreado(null); }}>
              <Text style={[styles.catChipText, categoriaId === cat.id && styles.catChipTextActive]}>
                {cat.nombre}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Paquetes */}
        <View style={styles.paquetesHeader}>
          <Text style={styles.sectionTitle}>Paquetes</Text>
          {paquetes.length < 3 && (
            <Pressable style={styles.addBtn} onPress={agregarPaquete}>
              <Text style={styles.addBtnText}>+ Agregar paquete</Text>
            </Pressable>
          )}
        </View>
        <Text style={styles.paquetesHint}>Podés ofrecer hasta 3 paquetes.</Text>

        {paquetes.map((paq, idx) => (
          <View key={paq._key} style={styles.paqueteForm}>
            <View style={styles.paqueteHeaderRow}>
              <Text style={styles.paqueteNum}>Paquete {idx + 1}</Text>
              {paquetes.length > 1 && (
                <Pressable onPress={() => eliminarPaquete(paq._key)}>
                  <Text style={styles.eliminarText}>✕ Eliminar</Text>
                </Pressable>
              )}
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nombre (ej: Básico, Estándar, Premium)"
              placeholderTextColor={colors.textMuted}
              value={paq.nombre}
              onChangeText={(v) => actualizarPaquete(paq._key, 'nombre', v)}
            />
            <View style={styles.paqueteRow}>
              <View style={styles.paqueteField}>
                <Text style={styles.fieldLabel}>Precio (ARS)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  value={paq.precio > 0 ? String(paq.precio) : ''}
                  onChangeText={(v) => actualizarPaquete(paq._key, 'precio', v)}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.paqueteField}>
                <Text style={styles.fieldLabel}>Días de entrega</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor={colors.textMuted}
                  value={paq.diasDeEntrega > 0 ? String(paq.diasDeEntrega) : ''}
                  onChangeText={(v) => actualizarPaquete(paq._key, 'diasDeEntrega', v)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        ))}

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable
          style={[styles.boton, (loading || !!gigCreado) && styles.botonDisabled]}
          onPress={handlePublicar}
          disabled={loading || !!gigCreado}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : gigCreado ? (
            <Text style={styles.botonTexto}>Gig ya publicado</Text>
          ) : (
            <Text style={styles.botonTexto}>🚀 Publicar Gig</Text>
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
  backText: { fontSize: 14, color: colors.textSecondary },
  navTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  scroll: { padding: 20, gap: 12, paddingBottom: 40 },
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
  successActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  successButtonPrimary: {
    flex: 1,
    backgroundColor: '#5DCAA5',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  successButtonPrimaryText: {
    color: colors.background,
    fontWeight: '800',
    fontSize: 13,
  },
  successButtonSecondary: {
    backgroundColor: 'transparent',
    borderColor: '#5DCAA5',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  successButtonSecondaryText: {
    color: '#5DCAA5',
    fontWeight: '700',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 90,
  },
  categoriasRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  catChip: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catChipActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  catChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  catChipTextActive: {
    color: colors.background,
  },
  paquetesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  addBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7eb3ff',
  },
  paquetesHint: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: -6,
  },
  paqueteForm: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  paqueteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paqueteNum: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7eb3ff',
  },
  eliminarText: {
    fontSize: 12,
    color: '#F09595',
    fontWeight: '600',
  },
  paqueteRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paqueteField: {
    flex: 1,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  errorText: {
    color: '#F09595',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  boton: {
    backgroundColor: colors.textPrimary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  botonDisabled: { opacity: 0.6 },
  botonTexto: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.background,
  },
});
