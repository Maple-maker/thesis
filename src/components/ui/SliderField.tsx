import { useCallback, useMemo, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  PanResponder,
  type GestureResponderEvent,
  Text,
  View,
} from "react-native";

const THUMB_SIZE = 24;
const TRACK_HEIGHT = 8;

type Props = {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  lowLabel?: string;
  highLabel?: string;
  formatValue?: (v: number) => string;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function snap(raw: number, min: number, max: number, step: number) {
  const snapped = Math.round(raw / step) * step;
  return clamp(snapped, min, max);
}

type SliderTrackProps = {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
};

function SliderTrack({ value, onChange, min, max, step }: SliderTrackProps) {
  const [width, setWidth] = useState(0);
  const widthRef = useRef(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    widthRef.current = w;
    setWidth(w);
  }, []);

  const valueFromX = useCallback(
    (x: number) => {
      const w = widthRef.current;
      if (w <= 0) return value;
      const ratio = clamp(x / w, 0, 1);
      const raw = min + ratio * (max - min);
      return snap(raw, min, max, step);
    },
    [min, max, step, value]
  );

  const applyX = useCallback(
    (evt: GestureResponderEvent) => {
      const next = valueFromX(evt.nativeEvent.locationX);
      if (next !== value) onChange(next);
    },
    [onChange, value, valueFromX]
  );

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponderCapture: () => true,
        onShouldBlockNativeResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: applyX,
        onPanResponderMove: applyX,
      }),
    [applyX]
  );

  const span = max - min || 1;
  const ratio = (value - min) / span;
  const fillWidth = width * ratio;
  const thumbLeft = clamp(fillWidth - THUMB_SIZE / 2, 0, Math.max(0, width - THUMB_SIZE));

  return (
    <View
      onLayout={onLayout}
      style={{ height: 40, justifyContent: "center" }}
      accessibilityRole="adjustable"
      accessibilityValue={{
        min,
        max,
        now: value,
        text: String(value),
      }}
      {...pan.panHandlers}
    >
      <View
        style={{
          height: TRACK_HEIGHT,
          borderRadius: TRACK_HEIGHT / 2,
          backgroundColor: "#EAEDE8",
          overflow: "hidden",
        }}
      >
        <View
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: TRACK_HEIGHT,
            width: fillWidth,
            borderRadius: TRACK_HEIGHT / 2,
            backgroundColor: "#0E7A66",
          }}
        />
      </View>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: thumbLeft,
          top: (40 - THUMB_SIZE) / 2,
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: THUMB_SIZE / 2,
          backgroundColor: "#0E7A66",
          borderWidth: 2,
          borderColor: "#FFFFFF",
          shadowColor: "#142F22",
          shadowOpacity: 0.18,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        }}
      />
    </View>
  );
}

export function SliderField({
  value,
  onChange,
  min,
  max,
  step = 1,
  lowLabel,
  highLabel,
  formatValue,
}: Props) {
  const display = formatValue ? formatValue(value) : String(value);

  return (
    <View>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-ink font-monoBold text-[22px]" style={{ letterSpacing: -0.5 }}>
          {display}
        </Text>
        <Text className="text-ink-3 text-[12px] font-sansMd">
          {min} – {max}
        </Text>
      </View>
      <SliderTrack value={value} onChange={onChange} min={min} max={max} step={step} />
      {(lowLabel || highLabel) && (
        <View className="flex-row justify-between mt-1">
          <Text className="text-ink-3 text-[11px] font-sansMd">{lowLabel}</Text>
          <Text className="text-ink-3 text-[11px] font-sansMd">{highLabel}</Text>
        </View>
      )}
    </View>
  );
}
