// src/components/FreeGiftBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getHeight } from '../../Theme/Constants';

interface FreeGiftBadgeProps {
  visible: boolean;
}

const FreeGiftBadge: React.FC<FreeGiftBadgeProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>gift</Text>
      <View style={styles.texts}>
        <Text style={styles.title}>Free Gift Added!</Text>
        <Text style={styles.subtitle}>Special gift included with your order.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
  },
  icon: { fontSize: getHeight(60), marginRight: 12 },
  texts: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: '#EF6C00' },
  subtitle: { fontSize: 13, color: '#000', opacity: 0.7 },
});

export default React.memo(FreeGiftBadge);