import { Pressable, StyleSheet, Text, View } from 'react-native';
import { User } from '../../types';

interface Props {
  kycStatus?: User['kycStatus'];
  onVerify?: () => void;
}

export const KycStatusBanner = ({ kycStatus, onVerify }: Props) => {
  if (kycStatus === 'PENDING') {
    return (
      <View style={[styles.base, styles.pending]}>
        <Text style={styles.text}>KYC баталгаажуулалт хүлээгдэж байна. Админ удахгүй баталгаажуулна.</Text>
      </View>
    );
  }
  if (kycStatus === 'REJECTED') {
    return (
      <View style={[styles.base, styles.rejected]}>
        <Text style={styles.text}>KYC татгалзагдсан. Дахин илгээнэ үү.</Text>
        <Pressable onPress={onVerify}>
          <Text style={styles.link}>Дахин илгээх</Text>
        </Pressable>
      </View>
    );
  }
  if (!kycStatus || kycStatus === 'NOT_SUBMITTED') {
    return (
      <View style={[styles.base, styles.notSubmitted]}>
        <Text style={styles.text}>Худалдан авалт хийхийн тулд мэдээлэлээ баталгаажуулна уу.</Text>
        <Pressable onPress={onVerify}>
          <Text style={styles.link}>Баталгаажуулах</Text>
        </Pressable>
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  base: { borderRadius: 12, padding: 12, marginBottom: 12 },
  pending: { backgroundColor: '#FFEAA7' },
  rejected: { backgroundColor: '#FFCDD2' },
  notSubmitted: { backgroundColor: '#D6EAF8' },
  text: { color: '#1A1A1A' },
  link: { marginTop: 6, fontWeight: '700', color: '#1A2942' },
});
