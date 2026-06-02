import { Text, View } from "react-native";

import { FormattedMessageText } from "@/components/chat/FormattedMessageText";
import { InteractiveMessageText } from "@/components/chat/InteractiveMessageText";
import type { ConceptId } from "@/data/concepts";
import type { ChatMessage } from "@/lib/assistant-chat";
import type { EntityKind } from "@/lib/message-entities";

type Props = {
  message: ChatMessage;
  onConceptPress?: (id: ConceptId) => void;
  onSymbolPress?: (symbol: string, kind: EntityKind) => void;
};

export function ChatBubble({ message, onConceptPress, onSymbolPress }: Props) {
  const isUser = message.role === "user";
  const interactive = !isUser && onConceptPress && onSymbolPress;

  return (
    <View className={`mb-3 ${isUser ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[88%] px-4 py-3 rounded-[16px] ${
          isUser
            ? "bg-brand rounded-br-[4px]"
            : "bg-bg-surface border border-line rounded-bl-[4px]"
        }`}
      >
        {isUser ? (
          <Text className="text-[14.5px] font-sansMd leading-[21px] text-white">
            {message.content}
          </Text>
        ) : interactive ? (
          <InteractiveMessageText
            content={message.content}
            onConceptPress={onConceptPress}
            onSymbolPress={onSymbolPress}
          />
        ) : (
          <FormattedMessageText content={message.content} />
        )}
      </View>
      {!isUser && (
        <Text className="text-ink-3 text-[10px] font-sansMd mt-1 ml-1">Thesis CFO</Text>
      )}
    </View>
  );
}
