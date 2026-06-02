import { Text, View } from "react-native";

type Props = {
  content: string;
  className?: string;
  boldClassName?: string;
};

/** Renders **bold** and simple bullet lines, no raw asterisks in the UI. */
export function FormattedMessageText({
  content,
  className = "text-[14.5px] font-sansMd leading-[21px] text-ink",
  boldClassName = "font-sansBold",
}: Props) {
  const blocks = content.split(/\n\n+/);

  return (
    <View className="gap-y-3">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => !l.trim() || /^[-•]\s/.test(l.trim()));

        if (isList && lines.some((l) => /^[-•]\s/.test(l.trim()))) {
          return (
            <View key={bi} className="gap-y-1.5">
              {lines
                .filter((l) => l.trim())
                .map((line, li) => (
                  <View key={li} className="flex-row">
                    <Text className={`${className} mr-2`}>•</Text>
                    <View className="flex-1">
                      <InlineFormatted
                        text={line.replace(/^[-•]\s*/, "")}
                        className={className}
                        boldClassName={boldClassName}
                      />
                    </View>
                  </View>
                ))}
            </View>
          );
        }

        return (
          <InlineFormatted
            key={bi}
            text={block}
            className={className}
            boldClassName={boldClassName}
          />
        );
      })}
    </View>
  );
}

function InlineFormatted({
  text,
  className,
  boldClassName,
}: {
  text: string;
  className: string;
  boldClassName: string;
}) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <Text className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <Text key={i} className={boldClassName}>
              {part.slice(2, -2)}
            </Text>
          );
        }
        return part;
      })}
    </Text>
  );
}
