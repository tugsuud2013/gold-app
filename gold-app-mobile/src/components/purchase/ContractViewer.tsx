import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Button } from '../common/Button';

interface Props {
  visible: boolean;
  onClose: () => void;
  contractText: string;
  qrValue?: string;
  onDownloadPdf?: () => void;
}

export const ContractViewer = ({ visible, onClose, contractText, qrValue, onDownloadPdf }: Props) => (
  <Modal visible={visible} animationType="slide" transparent>
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center' }}>
      <View style={{ margin: 16, borderRadius: 12, backgroundColor: '#fff', maxHeight: '80%', padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 10 }}>Гэрээ</Text>
        <ScrollView>
          <Text>{contractText}</Text>
          {qrValue ? (
            <View style={{ alignItems: 'center', marginTop: 12 }}>
              <QRCode value={qrValue} size={140} />
            </View>
          ) : null}
        </ScrollView>
        <View style={{ marginTop: 12, gap: 8 }}>
          <Button title="PDF татах" onPress={onDownloadPdf} fullWidth />
          <Pressable onPress={onClose}>
            <Text style={{ textAlign: 'center', color: '#1A2942', fontWeight: '700' }}>Хаах</Text>
          </Pressable>
        </View>
      </View>
    </View>
  </Modal>
);
