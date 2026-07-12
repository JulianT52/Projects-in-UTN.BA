import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../themes/colors';

type Tab = 'explorar' | 'pedidos';

type Props = {
  active: Tab;
  onExplorar: () => void;
  onPedidos: () => void;
};

export function ClienteTabBar({ active, onExplorar, onPedidos }: Props) {
  return (
    <View style={styles.bar}>
      <Pressable
        style={[styles.tab, active === 'explorar' && styles.tabActive]}
        onPress={onExplorar}>
        <Text style={[styles.tabIcon]}>🔍</Text>
        <Text style={[styles.tabText, active === 'explorar' && styles.tabTextActive]}>
          Explorar
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tab, active === 'pedidos' && styles.tabActive]}
        onPress={onPedidos}>
        <Text style={[styles.tabIcon]}>📦</Text>
        <Text style={[styles.tabText, active === 'pedidos' && styles.tabTextActive]}>
          Mis pedidos
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 3,
  },
  tabActive: {
    borderTopWidth: 2,
    borderTopColor: colors.textPrimary,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.textPrimary,
  },
});
