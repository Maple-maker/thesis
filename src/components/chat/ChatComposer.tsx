import { useState } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Icon } from "@/components/Icon";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
  loading?: boolean;
  placeholder?: string;
  /** Pre-fill composer (e.g. from scenario planning). */
  initialText?: string;
};

export function ChatComposer({
  onSend,
  disabled,
  loading,
  placeholder = "Ask your CFO anything…",
  initialText = "",
}: Props) {
  const [text, setText] = useState(initialText);
  const insets = useSafeAreaInsets();

  const submit = () => {
    const t = text.trim();
    if (!t || disabled || loading) return;
    setText("");
    onSend(t);
  };

  return (
    <View
      className="px-4 pt-2 border-t border-line bg-bg-surface"
      style={{ paddingBottom: Math.max(insets.bottom, 12) }}
    >
      <View className="flex-row items-end gap-2">
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeholder}
          placeholderTextColor="#8C988F"
          multiline
          maxLength={2000}
          editable={!disabled && !loading}
          className="flex-1 min-h-[44px] max-h-[120px] px-4 py-3 rounded-[14px] bg-bg-surface2 border border-line text-ink text-[15px] font-sansMd"
        />
        <Pressable
          onPress={submit}
          disabled={disabled || loading || !text.trim()}
          className={`w-[44px] h-[44px] rounded-full items-center justify-center ${
            text.trim() && !disabled ? "bg-brand" : "bg-track"
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Icon name="arrow" size={18} color={text.trim() ? "#FFFFFF" : "#8C988F"} sw={2.2} />
          )}
        </Pressable>
      </View>
    </View>
  );
}
