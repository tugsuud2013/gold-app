import { useRef, useState } from 'react';
import { Text, View } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../components/common/Button';

type Props = NativeStackScreenProps<any>;

export const SignatureScreen = ({ navigation }: Props) => {
  const signatureRef = useRef<any>(null);
  const [currentValue, setCurrentValue] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 10 }}>Гарын үсэг зурах</Text>
      <View style={{ flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden' }}>
        <SignatureCanvas
          ref={signatureRef}
          onOK={(sig) => {
            setCurrentValue(sig);
          }}
          clearText="Арилгах"
          confirmText="Хадгалах"
          descriptionText=""
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <View style={{ flex: 1 }}>
          <Button title="Арилгах" variant="secondary" fullWidth onPress={() => signatureRef.current?.clearSignature()} />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title="Хадгалах"
            fullWidth
            onPress={() => {
              if (currentValue) {
                navigation.goBack();
              } else {
                signatureRef.current?.readSignature();
              }
            }}
          />
        </View>
      </View>
    </View>
  );
};
