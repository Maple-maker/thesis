import { Modal, Text, View, Button as RNButton } from "react-native";

type Props = {
  visible: boolean;
  userId: string | null;
  onClose: () => void;
  onEnrolled: () => void;
};

export function MfaSetupSheet({ visible, userId, onClose, onEnrolled }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-surface rounded-t-3xl p-6">
          <Text className="text-ink text-[18px] font-sansBold mb-3">Security Setup</Text>
          <Text className="text-ink-2 text-[14px] mb-4">
            MFA setup coming soon. Tap Skip to continue.
          </Text>
          <RNButton title="Skip (Demo)" onPress={onEnrolled} />
          <View className="h-3" />
          <RNButton title="Cancel" onPress={onClose} color="#666" />
        </View>
      </View>
    </Modal>
  );
}
