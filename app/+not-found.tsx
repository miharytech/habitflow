import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text, View } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import Colors from '@/constants/Colors';
import { Fonts } from '@/constants/Fonts';
import { useT } from '@/context/I18nContext';

export default function NotFoundScreen() {
  const scheme = useColorScheme();
  const theme = Colors[scheme];
  const t = useT();

  return (
    <>
      <Stack.Screen options={{ title: t.notFound.header }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={styles.emoji}>🧭</Text>
        <Text style={[styles.title, { color: theme.text }]}>{t.notFound.title}</Text>

        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: theme.tint }]}>{t.notFound.home}</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emoji: { fontSize: 40, marginBottom: 12 },
  title: {
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    fontSize: 15,
    fontFamily: Fonts.extrabold,
  },
});
