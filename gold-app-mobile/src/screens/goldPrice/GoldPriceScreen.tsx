import { useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Polyline, Text as SvgText } from 'react-native-svg';
import { useCurrentPrice, usePriceHistory } from '../../hooks/useGoldPrice';
import { formatDate, formatDateTime, formatMNT } from '../../utils/formatters';

const filters = [
  { key: '1d', label: '1 өдөр' },
  { key: '7d', label: '7 хоног' },
  { key: '1m', label: '1 сар' },
  { key: '6m', label: '6 сар' },
  { key: '1y', label: '1 жил' },
] as const;

export const GoldPriceScreen = () => {
  const [filter, setFilter] = useState<(typeof filters)[number]['key']>('7d');
  const [activePoint, setActivePoint] = useState<{ x: string; y: number } | null>(null);
  const current = useCurrentPrice();
  const history = usePriceHistory(filter);
  const points = useMemo(
    () =>
      (history.data ?? []).map((it) => ({
        x: formatDate(it.updatedAt),
        y: it.pricePerGram,
      })),
    [history.data],
  );

  const stats = useMemo(() => {
    const values = points.map((p) => p.y);
    if (!values.length) return { max: 0, min: 0, avg: 0 };
    return {
      max: Math.max(...values),
      min: Math.min(...values),
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    };
  }, [points]);

  return (
    <FlatList
      data={(history.data ?? []).slice(0, 10)}
      keyExtractor={(item) => item.updatedAt}
      contentContainerStyle={{ padding: 16, gap: 10 }}
      ListHeaderComponent={
        <View>
          <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 10 }}>Алтны ханш</Text>
          <LinearGradient colors={['#8B6914', '#FFD700']} style={{ borderRadius: 16, padding: 16 }}>
            <Text style={{ color: '#fff' }}>Монголбанкны ханш</Text>
            <Text style={{ color: '#fff', fontSize: 34, fontWeight: '800' }}>
              {formatMNT(current.data?.pricePerGram ?? 320000)}/г
            </Text>
            <Text style={{ color: (current.data?.changePercent ?? 0) >= 0 ? '#2ECC71' : '#E74C3C', fontWeight: '700' }}>
              {(current.data?.changeAmount ?? 0) >= 0 ? '+' : ''}
              {formatMNT(current.data?.changeAmount ?? 2000)} ({(current.data?.changePercent ?? 0.63) >= 0 ? '▲' : '▼'}{' '}
              {Math.abs(current.data?.changePercent ?? 0.63).toFixed(2)}%)
            </Text>
            <Text style={{ color: '#fff', marginTop: 6 }}>Сүүлд шинэчлэгдсэн: {formatDateTime(current.data?.updatedAt ?? new Date())}</Text>
          </LinearGradient>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
            {filters.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={{
                  borderWidth: 1,
                  borderColor: filter === f.key ? '#B8860B' : '#DDD',
                  borderRadius: 999,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                }}
              >
                <Text>{f.label}</Text>
              </Pressable>
            ))}
          </View>
          <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', marginTop: 12, padding: 8 }}>
            {(() => {
              const width = Dimensions.get('window').width - 64;
              const height = 220;
              const values = points.map((p) => p.y);
              const max = Math.max(...values, 1);
              const min = Math.min(...values, 0);
              const pointString = points
                .map((p, i) => {
                  const x = (i / Math.max(points.length - 1, 1)) * width;
                  const y = height - ((p.y - min) / Math.max(max - min, 1)) * (height - 24) - 12;
                  return `${x},${y}`;
                })
                .join(' ');
              return (
                <Svg width={width} height={height}>
                  <Line x1="0" y1={height - 12} x2={width} y2={height - 12} stroke="#ddd" strokeWidth="1" />
                  <Polyline
                    points={pointString}
                    fill="none"
                    stroke="#B8860B"
                    strokeWidth="2"
                    onPress={() => {
                      const last = points[points.length - 1];
                      if (last) setActivePoint({ x: last.x, y: last.y });
                    }}
                  />
                  <SvgText x={0} y={12} fontSize={10} fill="#777">
                    {`${Math.round(max / 1000)}К`}
                  </SvgText>
                </Svg>
              );
            })()}
            {activePoint ? <Text style={{ textAlign: 'center' }}>{activePoint.x}: {formatMNT(activePoint.y)}</Text> : null}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <Text>Хамгийн өндөр: {formatMNT(stats.max)}</Text>
            <Text>Хамгийн доод: {formatMNT(stats.min)}</Text>
            <Text>Дундаж: {formatMNT(stats.avg)}</Text>
          </View>
          <Text style={{ marginTop: 12, fontWeight: '700' }}>Үнийн түүх</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={{ borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text>{formatDate(item.updatedAt)}</Text>
          <Text>{formatMNT(item.pricePerGram)}</Text>
          <Text style={{ color: (item.changePercent ?? 0) >= 0 ? '#27AE60' : '#E74C3C' }}>
            {(item.changePercent ?? 0) >= 0 ? '+' : ''}
            {(item.changePercent ?? 0).toFixed(2)}%
          </Text>
        </View>
      )}
    />
  );
};
