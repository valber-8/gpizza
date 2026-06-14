import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useT } from '../i18n';
import { Colors } from '../constants/theme';

export function LangToggle() {
  const { lang, setLang } = useT();
  return (
    <View style={styles.wrap}>
      <TouchableOpacity onPress={() => setLang('sv')} style={styles.btn}>
        <Text style={[styles.text, lang === 'sv' && styles.active]}>SV</Text>
      </TouchableOpacity>
      <Text style={styles.sep}>|</Text>
      <TouchableOpacity onPress={() => setLang('en')} style={styles.btn}>
        <Text style={[styles.text, lang === 'en' && styles.active]}>EN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', marginRight: 8 },
  btn: { paddingHorizontal: 6, paddingVertical: 4 },
  text: { color: 'rgba(255,255,255,0.6)', fontWeight: '600', fontSize: 13 },
  active: { color: '#fff', fontWeight: '900' },
  sep: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
});
