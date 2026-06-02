import Svg, { Circle } from "react-native-svg";
import { View, Text } from "react-native";

type Slice = { pct: number; color: string };

type Props = {
  slices: Slice[];
  size?: number;
  centerLabel?: string;
};

export function AllocationDonut({ slices, size = 160, centerLabel }: Props) {
  const stroke = 22;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <View className="items-center my-4">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="#ffffff18"
            strokeWidth={stroke}
            fill="none"
          />
          {slices.map((s, i) => {
            const dash = (s.pct / 100) * circ;
            const gap = circ - dash;
            const el = (
              <Circle
                key={i}
                cx={cx}
                cy={cy}
                r={r}
                stroke={s.color}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            );
            offset += dash;
            return el;
          })}
        </Svg>
        {centerLabel ? (
          <View
            className="absolute inset-0 items-center justify-center"
            pointerEvents="none"
          >
            <Text className="text-white/60 text-[10px] font-sansX uppercase">Targets</Text>
            <Text className="text-white font-monoBold text-[13px]">{centerLabel}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
