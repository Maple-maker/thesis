import { Modal, Text, View, Button as RNButton } from "react-native";
import type { LinkedAccount } from "@/types/linked-accounts";

type Props = {
  visible: boolean;
  userId: string | null;
  onAccountsLinked: (accounts: LinkedAccount[]) => void;
  onClose: () => void;
};

export function PlaidLinkModal({ visible, userId, onAccountsLinked, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-surface rounded-t-3xl p-6">
          <Text className="text-ink text-[18px] font-sansBold mb-3">Link Accounts</Text>
          <Text className="text-ink-2 text-[14px] mb-4">
            Plaid integration coming soon. Tap below to load demo accounts.
          </Text>
          <RNButton title="Load Demo Accounts" onPress={() => { onAccountsLinked([]); onClose(); }} />
          <View className="h-3" />
          <RNButton title="Cancel" onPress={onClose} color="#666" />
        </View>
      </View>
    </Modal>
  );
}
