import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../store/auth.store';
import { MembershipBadge } from '../../components/common/MembershipBadge';
import { MembershipProgress } from '../../components/common/MembershipProgress';
import { formatPhone } from '../../utils/formatters';

export const ProfileScreen = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const menus = [
    { icon: '📋', label: 'Худалдааны түүх', action: () => navigation.getParent()?.navigate('Wallet') },
    { icon: '📄', label: 'Миний гэрээнүүд', action: () => navigation.navigate('ContractList') },
    { icon: '🔔', label: 'Мэдэгдлийн тохиргоо', action: () => {} },
    { icon: '🔒', label: 'Нууц үг солих', action: () => navigation.navigate('ChangePassword') },
    { icon: 'ℹ️', label: 'Апп тухай', action: () => {} },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5', padding: 16 }}>
      <View style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14 }}>
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            backgroundColor: '#B8860B',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>
            {(user?.fullName ?? user?.phone ?? 'U').slice(0, 2).toUpperCase()}
          </Text>
        </View>
        <Text style={{ fontSize: 22, fontWeight: '700', marginTop: 8 }}>{user?.fullName || user?.phone}</Text>
        <Text style={{ color: '#666', marginTop: 2 }}>{formatPhone(user?.phone ?? '')}</Text>
        <View style={{ marginTop: 8 }}>
          <MembershipBadge membership={user?.membership ?? 'NORMAL'} />
        </View>
        <Text style={{ marginTop: 8, color: '#666' }}>
          KYC: {user?.kycStatus === 'APPROVED' || user?.kycStatus === 'VERIFIED' ? 'Баталгаажсан' : user?.kycStatus ?? 'Илгээгээгүй'}
        </Text>
      </View>

      <View style={{ marginTop: 12 }}>
        <MembershipProgress membership={user?.membership ?? 'NORMAL'} totalGrams={8} />
      </View>

      <View style={{ marginTop: 12, backgroundColor: '#fff', borderRadius: 14, padding: 10 }}>
        {menus.map((menu) => (
          <Pressable
            key={menu.label}
            onPress={menu.action}
            style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', gap: 8 }}
          >
            <Text>{menu.icon}</Text>
            <Text style={{ fontWeight: '600' }}>{menu.label}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ marginTop: 12, marginBottom: 24 }}>
        <Button
          title="Гарах"
          variant="danger"
          fullWidth
          onPress={() =>
            Alert.alert('Анхаар', 'Та гарахдаа итгэлтэй байна уу?', [
              { text: 'Үгүй', style: 'cancel' },
              { text: 'Тийм', style: 'destructive', onPress: () => logout() },
            ])
          }
        />
      </View>
    </ScrollView>
  );
};
