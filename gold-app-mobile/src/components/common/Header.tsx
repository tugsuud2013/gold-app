import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

export const Header = ({ title, right }: { title: string; right?: ReactNode }) => (
  <View style={styles.wrap}>
    <Text style={styles.title}>{title}</Text>
    <View>{right}</View>
  </View>
);

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { ...theme.typography.h2, color: theme.colors.dark },
});
