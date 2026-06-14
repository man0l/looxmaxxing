import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

export function AvatarsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Avatars</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
  },
});
