import { Pressable, Text, View } from 'react-native';
import { theme } from '../../theme';

const grams = [0.1, 0.5, 1, 2.5, 5];

export const GramSelector = ({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (value: number) => void;
}) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
    {grams.map((g) => (
      <Pressable
        key={g}
        onPress={() => onSelect(g)}
        style={{
          borderWidth: 1,
          borderColor: selected === g ? theme.colors.primary : theme.colors.border,
          borderRadius: 999,
          paddingHorizontal: 12,
          paddingVertical: 6,
          backgroundColor: selected === g ? theme.colors.primaryLight : '#fff',
        }}
      >
        <Text>{g} гр</Text>
      </Pressable>
    ))}
  </View>
);
