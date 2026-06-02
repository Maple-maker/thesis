import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { GoDeeperVideos } from "@/components/GoDeeperVideos";
import { Icon } from "@/components/Icon";
import { conceptById, type ConceptId } from "@/data/concepts";
import { youtubeForConcept } from "@/data/youtube-resources";
import { Tag } from "./ui/Tag";

type Props = {
  conceptId: ConceptId | null;
  visible: boolean;
  onClose: () => void;
  onSelectRelated?: (id: ConceptId) => void;
};

const shadow = {
  shadowColor: "#142F22",
  shadowOpacity: 0.12,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: -4 },
  elevation: 4,
} as const;

const tierLabel: Record<string, string> = {
  foundational: "Basics",
  intermediate: "Deeper",
  advanced: "Advanced",
};

const tierTone: Record<string, "brand" | "amber" | "violet"> = {
  foundational: "brand",
  intermediate: "amber",
  advanced: "violet",
};

function ConceptChip({
  id,
  onPress,
}: {
  id: ConceptId;
  onPress?: (id: ConceptId) => void;
}) {
  const c = conceptById(id);
  if (!c) return null;

  const body = (
    <View className="px-[13px] py-[8px] rounded-chip bg-bg-surface2 border border-line">
      <Text className="text-[13px] font-sansSb text-ink-2">{c.term}</Text>
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable onPress={() => onPress(id)} className="active:opacity-70">
      {body}
    </Pressable>
  );
}

export function ExplainSheet({ conceptId, visible, onClose, onSelectRelated }: Props) {
  const concept = conceptId ? conceptById(conceptId) : undefined;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end">
        <Pressable
          className="absolute inset-0 bg-[#142F22]/30"
          onPress={onClose}
          accessibilityLabel="Close"
        />
        <View
          className="bg-bg-surface rounded-sheet px-[22px] pt-[14px] pb-[34px]"
          style={shadow}
        >
          <View className="items-center mb-[14px]">
            <View className="w-[36px] h-[5px] rounded-full bg-line-strong mb-[16px]" />
            <Pressable
              onPress={onClose}
              className="absolute right-0 top-[-4px] w-[36px] h-[36px] items-center justify-center rounded-[11px] bg-bg-surface2"
            >
              <Icon name="close" size={18} sw={2.2} color="#4D5A54" />
            </Pressable>
          </View>

          {concept ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              style={{ maxHeight: 460 }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="mb-[18px]">
                <View className="flex-row items-center mb-[10px] gap-[8px]">
                  <Tag
                    label={tierLabel[concept.tier] ?? concept.tier}
                    tone={tierTone[concept.tier] ?? "brand"}
                  />
                </View>
                <Text className="text-[22px] font-sansX text-ink leading-[28px]">
                  {concept.term}
                </Text>
              </View>

              <Text className="text-[15px] font-sans text-ink-2 leading-[23px] mb-[18px]">
                {concept.body}
              </Text>

              {concept.whyItMatters ? (
                <View className="bg-bg-surface2 rounded-[14px] px-[16px] py-[14px] mb-[20px]">
                  <Text className="text-[12px] font-sansX text-brand uppercase tracking-wider mb-[6px]">
                    Why it matters
                  </Text>
                  <Text className="text-[14px] font-sans text-ink-2 leading-[21px]">
                    {concept.whyItMatters}
                  </Text>
                </View>
              ) : null}

              {concept.related && concept.related.length > 0 ? (
                <View className="mb-[12px]">
                  <Text className="text-[12px] font-sansBold text-ink-3 uppercase tracking-wider mb-[10px]">
                    Related
                  </Text>
                  <View className="flex-row flex-wrap gap-[8px]">
                    {concept.related
                      .filter((rid) => conceptById(rid))
                      .map((rid) => (
                        <ConceptChip
                          key={rid}
                          id={rid}
                          onPress={onSelectRelated}
                        />
                      ))}
                  </View>
                </View>
              ) : null}

              {concept.nextConcept && onSelectRelated ? (
                <View className="mb-[16px]">
                  <View className="flex-row items-center mb-[10px]">
                    <Icon name="arrow" size={12} color="#0E7A66" sw={2.5} />
                    <Text className="text-[12px] font-sansX text-ink uppercase tracking-wider ml-1.5">
                      What to learn next
                    </Text>
                  </View>
                  <ConceptChip id={concept.nextConcept} onPress={onSelectRelated} />
                </View>
              ) : null}

              <GoDeeperVideos
                videos={youtubeForConcept(concept.id)}
                title="Watch on YouTube"
                compact
              />
            </ScrollView>
          ) : (
            <View className="items-center py-[40px]">
              <Text className="text-[15px] font-sans text-ink-3">Concept not found.</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
