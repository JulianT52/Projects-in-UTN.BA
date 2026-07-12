import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  loginCliente,
  loginFreelancer,
  registrarCliente,
  registrarFreelancer,
} from '../api/authApi';
import { ApiError } from '../api/client';
import { colors } from '../themes/colors';
import type { TipoUsuario } from '../types/usuario';
import { useAuth } from '../auth/AuthContext';

type Modo = 'login' | 'registro';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { setUsuario } = useAuth();

  const [rol, setRol] = useState<TipoUsuario>('CLIENTE');
  const [modo, setModo] = useState<Modo>('login');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      const usuario =
        modo === 'login'
          ? rol === 'CLIENTE'
            ? await loginCliente({ email, password })
            : await loginFreelancer({ email, password })
          : rol === 'CLIENTE'
            ? await registrarCliente({ nombre, apellido, email, password })
            : await registrarFreelancer({ nombre, apellido, email, password });

      setUsuario(usuario);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No pudimos conectar con el servidor. Revisá que el backend esté corriendo.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Do It</Text>
        <Text style={styles.subtitle}>
          {modo === 'login' ? 'Ingresá a tu cuenta' : 'Creá tu cuenta'}
        </Text>
      </View>

      <View style={styles.segmented}>
        <Pressable
          style={[styles.segment, rol === 'CLIENTE' && styles.segmentActive]}
          onPress={() => setRol('CLIENTE')}>
          <Text style={[styles.segmentText, rol === 'CLIENTE' && styles.segmentTextActive]}>
            Cliente
          </Text>
        </Pressable>
        <Pressable
          style={[styles.segment, rol === 'FREELANCER' && styles.segmentActive]}
          onPress={() => setRol('FREELANCER')}>
          <Text style={[styles.segmentText, rol === 'FREELANCER' && styles.segmentTextActive]}>
            Freelancer
          </Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        {modo === 'registro' && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor={colors.textMuted}
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Apellido"
              placeholderTextColor={colors.textMuted}
              value={apellido}
              onChangeText={setApellido}
            />
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.submitText}>
              {modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
            </Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => {
            setError(null);
            setModo(modo === 'login' ? 'registro' : 'login');
          }}>
          <Text style={styles.switchModeText}>
            {modo === 'login' ? '¿No tenés cuenta? Creá una' : '¿Ya tenés cuenta? Ingresá'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 28,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: colors.textPrimary,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.background,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.textPrimary,
  },
  errorText: {
    color: '#F09595',
    fontSize: 13,
  },
  submitButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  submitText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
  switchModeText: {
    color: colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});