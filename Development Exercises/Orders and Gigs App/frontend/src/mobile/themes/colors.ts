export const colors = {
  background: '#0d0d0d',
  surface: '#161616',
  surfaceAlt: '#1f1f1f',
  border: '#262626',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
  textMuted: '#6b6b6b',
};

export const estadoColors: Record<string, { text: string; bg: string }> = {
  PENDIENTE: { text: '#EF9F27', bg: '#412402' },
  CONFIRMADO: { text: '#5DCAA5', bg: '#04342C' },
  EN_REVISION: { text: '#85B7EB', bg: '#042C53' },
  ENTREGADO: { text: '#97C459', bg: '#173404' },
  CANCELADO: { text: '#F09595', bg: '#501313' },
};

export const estadoColorFallback = { text: colors.textSecondary, bg: colors.surfaceAlt };