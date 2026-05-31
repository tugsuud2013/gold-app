import { useMemo, useRef, useState } from 'react';
import { Alert, Image, ScrollView, Text, View } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { userApi } from '../../api/user.api';
import { useAuthStore, persistUserSnapshot } from '../../store/auth.store';

const steps = ['Хувийн мэдээлэл', 'Гарын үсэг', 'Баталгаажуулалт'];

type Props = NativeStackScreenProps<any>;

const registerRegex = /^[А-ЯӨҮЁ]{2}\d{8}$/;

export const KycScreen = ({ navigation }: Props) => {
  const [step, setStep] = useState(1);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [signatureImageBase64, setSignatureImageBase64] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const signatureRef = useRef<any>(null);
  const user = useAuthStore((s) => s.user);
  const setSession = useAuthStore((s) => s.setSession);
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);

  const maskedRegister = useMemo(() => {
    if (registerNumber.length < 4) return registerNumber;
    return `${registerNumber.slice(0, 2)}****${registerNumber.slice(-4)}`;
  }, [registerNumber]);

  const saveStep1 = () => {
    const normalized = registerNumber.toUpperCase();
    if (!lastName || !firstName) return setError('Овог, нэрээ бүрэн оруулна уу.');
    if (!registerRegex.test(normalized)) return setError('Регистрийн формат буруу байна. Жишээ: АБ12345678');
    setError('');
    setRegisterNumber(normalized);
    setStep(2);
  };

  const submit = async () => {
    if (!signatureImageBase64) return setError('Гарын үсгээ оруулна уу.');
    try {
      setLoading(true);
      setError('');
      await userApi.submitKyc({ firstName, lastName, registerNumber, signatureImageBase64 });
      if (user && token) {
        const updatedUser = {
          ...user,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim(),
          registerNumber,
          signatureImageBase64,
          kycStatus: 'PENDING' as const,
        };
        setSession(token, refreshToken, updatedUser);
        await persistUserSnapshot(updatedUser);
      }
      Alert.alert('Амжилттай', 'KYC мэдээлэл амжилттай илгээгдлээ.');
      navigation.navigate('Tabs');
    } catch (e) {
      setError((e as Error).message || 'KYC илгээхэд алдаа гарлаа.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {steps.map((item, idx) => (
          <View
            key={item}
            style={{
              flex: 1,
              padding: 8,
              borderRadius: 8,
              backgroundColor: idx + 1 <= step ? '#B8860B' : '#EAEAEA',
            }}
          >
            <Text style={{ color: idx + 1 <= step ? '#fff' : '#666', fontSize: 12 }}>{`Алхам ${idx + 1}: ${item}`}</Text>
          </View>
        ))}
      </View>

      {step === 1 ? (
        <View>
          <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 10 }}>Таны мэдээллийг оруулна уу</Text>
          <Input label="Овог" value={lastName} onChangeText={setLastName} />
          <Input label="Нэр" value={firstName} onChangeText={setFirstName} />
          <Input
            label="Регистрийн дугаар (АБ12345678)"
            value={registerNumber}
            onChangeText={(v) => setRegisterNumber(v.toUpperCase())}
            placeholder="АБ12345678"
          />
          {error ? <Text style={{ color: '#E74C3C', marginBottom: 8 }}>{error}</Text> : null}
          <Button title="Үргэлжлүүлэх" fullWidth onPress={saveStep1} />
        </View>
      ) : null}

      {step === 2 ? (
        <View>
          <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 4 }}>Цахим гарын үсэг</Text>
          <Text style={{ marginBottom: 10 }}>Доорх хэсэгт гарын үсгээ зурна уу</Text>
          <View style={{ height: 200, borderWidth: 1, borderColor: '#DDD', borderRadius: 8, overflow: 'hidden' }}>
            <SignatureCanvas
              ref={signatureRef}
              onOK={(sig) => {
                setSignatureImageBase64(sig);
                setStep(3);
              }}
              onEmpty={() => setError('Гарын үсгээ зурна уу.')}
              descriptionText=""
              clearText="Арилгах"
              confirmText="Хадгалах"
              webStyle={'.m-signature-pad--footer {display: flex;} body,html {width:100%;height:100%;}'}
            />
          </View>
          <View style={{ marginTop: 10 }}>
            <Button title="Арилгах" variant="secondary" onPress={() => signatureRef.current?.clearSignature()} />
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <View>
          <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 10 }}>Баталгаажуулалт</Text>
          <Text>Овог нэр: {lastName} {firstName}</Text>
          <Text>Регистр: {maskedRegister}</Text>
          <Text style={{ marginTop: 10, marginBottom: 4 }}>Гарын үсэг:</Text>
          {signatureImageBase64 ? (
            <Image source={{ uri: signatureImageBase64 }} style={{ width: '100%', height: 120, borderWidth: 1, borderColor: '#ddd' }} />
          ) : null}
          {error ? <Text style={{ color: '#E74C3C', marginTop: 8 }}>{error}</Text> : null}
          <View style={{ marginTop: 12 }}>
            <Button title="Илгээх" fullWidth loading={loading} onPress={submit} />
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};
