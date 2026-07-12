import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useAuth } from '../auth/AuthContext';

export function CerrarSesionButton() {
  const { setUsuario } = useAuth();

  return (
    <Pressable onPress={() => setUsuario(null)}>
      <Text style={styles.text}>Cerrar sesión</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#a0a0a0',
    fontSize: 12,
    fontWeight: '600',
  },
});