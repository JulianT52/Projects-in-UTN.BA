import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  value: number;         // 0–5
  onChange?: (val: number) => void;
  size?: number;
};

export function RatingStars({ value, onChange, size = 28 }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable
          key={star}
          onPress={() => onChange?.(star)}
          style={styles.starWrap}
          disabled={!onChange}>
          <Text style={[styles.star, { fontSize: size }, star <= value ? styles.active : styles.inactive]}>
            ★
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
  },
  starWrap: {
    padding: 2,
  },
  star: {
    lineHeight: 32,
  },
  active: {
    color: '#F4C542',
  },
  inactive: {
    color: '#333333',
  },
});
