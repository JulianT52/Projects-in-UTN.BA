import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../themes/colors';
import type { Mensaje } from '../types/gig';

type Props = {
  mensaje: Mensaje;
  miId: number;
};

export function MensajeBurbuja({ mensaje, miId }: Props) {
  const esMio = mensaje.usuario?.id === miId;
  const nombreRemitente = [mensaje.usuario?.nombre, mensaje.usuario?.apellido]
    .filter(Boolean)
    .join(' ');

  const hora = mensaje.fechaEnvio
    ? new Date(mensaje.fechaEnvio).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <View style={[styles.wrapper, esMio ? styles.wrapperRight : styles.wrapperLeft]}>
      {!esMio && <Text style={styles.remitente}>{nombreRemitente || 'Usuario'}</Text>}
      <View style={[styles.burbuja, esMio ? styles.burbujaPropia : styles.burbujaAjena]}>
        <Text style={[styles.texto, esMio ? styles.textoPropio : styles.textoAjeno]}>
          {mensaje.mensaje}
        </Text>
      </View>
      {hora ? <Text style={styles.hora}>{hora}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    maxWidth: '78%',
    gap: 2,
  },
  wrapperLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  wrapperRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  remitente: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
    fontWeight: '600',
  },
  burbuja: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  burbujaPropia: {
    backgroundColor: '#1a3d6b',
    borderBottomRightRadius: 4,
  },
  burbujaAjena: {
    backgroundColor: colors.surfaceAlt,
    borderBottomLeftRadius: 4,
  },
  texto: {
    fontSize: 14,
    lineHeight: 20,
  },
  textoPropio: {
    color: '#e8f0ff',
  },
  textoAjeno: {
    color: colors.textPrimary,
  },
  hora: {
    fontSize: 10,
    color: colors.textMuted,
    marginHorizontal: 4,
  },
});
