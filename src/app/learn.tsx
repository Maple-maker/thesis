import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { Icon, type IconName } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { conceptById, conceptsByTier, type Concept, type ConceptId, type ConceptTier } from "@/data/concepts";
import { isAppropriateFor } from "@/lib/concept-filter";
import { conceptsForExperience } from "@/lib/concept-filter";
import { useStore } from "@/store";

const TIER_META: Record<ConceptTier, { label: string; icon: IconName }> = {
  foundational: { label: "The basics", icon: "cap" },
  intermediate: { label: "Going deeper", icon: "trend" },
  advanced: { label: "Advanced", icon: "bolt" },
};

const TIER_ORDER: ConceptTier[] = ["foundational", "intermediate", "advanced"];

export default function LearnScreen() {
  const router = useRouter();
  const experience = useStore((s) => s.profile.experience);

  const concepts = useMemo(() => conceptsForExperience(experience), [experience]);
  const [expanded, setExpanded] = useState(new Set<ConceptId>());

  const toggleExpanded = (id: ConceptId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandRelated = (otherId: ConceptId) => {
    // If the related concept is in our set, expand it
    if (concepts.some((c) => c.id === otherId)) {
      setExpanded((prev) => {
        const next = new Set(prev);
        next.add(otherId);
        return next;
      });
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        <View>
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
            Reference
          </Text>
          <Text
            className="text-ink font-displayX text-[28px] mt-0.5"
            style={{ letterSpacing: -0.6, lineHeight: 31 }}
          >
            Learn
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          className="w-[40px] h-[40px] rounded-full bg-bg-surface border border-line items-center justify-center active:opacity-70"
        >
          <Icon name="close" size={18} color="#16201C" sw={2} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-ink-2 text-[14.5px] font-sansMd leading-[21px] mb-6">
          Plain-English explainers for investing concepts — tap any card to read more.
        </Text>

        {TIER_ORDER.map((tier) => {
          const group = concepts.filter((c) => c.tier === tier);
          if (!group.length) return null;
          const meta = TIER_META[tier];
          return (
            <View key={tier} className="mb-6">
              <View className="flex-row items-center mb-3">
                <View className="w-[32px] h-[32px] rounded-[9px] bg-brand-bg items-center justify-center mr-2.5">
                  <Icon name={meta.icon} size={16} color="#0E7A66" sw={2} />
                </View>
                <Text className="text-ink font-displayX text-[19px]" style={{ letterSpacing: -0.3 }}>
                  {meta.label}
                </Text>
                <Text className="text-ink-3 text-[12px] font-monoSb ml-2 mt-0.5">
                  {group.length}
                </Text>
              </View>

              <View className="gap-y-2">
                {group.map((c) => (
                  <ConceptCard
                    key={c.id}
                    concept={c}
                    expanded={expanded.has(c.id)}
                    onToggle={() => toggleExpanded(c.id)}
                    onRelated={expandRelated}
                  />
                ))}
              </View>
            </View>
          );
        })}

        {/* Disclaimer */}
        <View className="mt-2 mb-4">
          <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px]">
            Educational tool. Not investment advice. Do your own research.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function ConceptCard({
  concept,
  expanded,
  onToggle,
  onRelated,
}: {
  concept: Concept;
  expanded: boolean;
  onToggle: () => void;
  onRelated: (id: ConceptId) => void;
}) {
  const experience = useStore((s) => s.profile.experience);
  const [hasAnimated, setHasAnimated] = useState(false);

  return (
    <Animated.View entering={hasAnimated ? undefined : FadeInUp.duration(350)} onLayout={() => setHasAnimated(true)}>
      <Pressable onPress={onToggle}>
        <Card pad={14}>
          <View className="flex-row items-start">
            {/* Dotted indicator */}
            <View
              className={`w-[3px] h-full rounded-full mr-3 ${expanded ? "bg-brand" : "bg-line-strong"}`}
              style={{ minHeight: expanded ? 24 : 22 }}
            />
            <View className="flex-1">
              {/* Term + expand indicator */}
              <View className="flex-row items-center justify-between">
                <Text className="text-ink text-[15px] font-sansBold flex-1 leading-[20px]">
                  {concept.term}
                </Text>
                <View style={{ transform: expanded ? [{ rotate: "180deg" }] : undefined }}>
                  <Icon name="chevDown" size={16} color="#8C988F" sw={2.2} />
                </View>
              </View>
              {/* Short description (always visible) */}
              {!expanded && (
                <Text className="text-ink-2 text-[13px] font-sansMd mt-0.5 leading-[18px]">
                  {concept.short}
                </Text>
              )}

              {/* Expanded body */}
              {expanded && (
                <View className="mt-3">
                  <Text className="text-ink text-[13px] font-sansMd leading-[19px]">
                    {concept.body}
                  </Text>
                  {concept.whyItMatters && (
                    <>
                      <View className="flex-row items-center mt-4 mb-1.5">
                        <Icon name="sparkle" size={13} color="#0E7A66" sw={2} />
                        <Text className="text-ink text-[12px] font-sansX uppercase tracking-wider ml-1.5">
                          Why it matters
                        </Text>
                      </View>
                      <Text className="text-ink-2 text-[13px] font-sansMd leading-[19px]">
                        {concept.whyItMatters}
                      </Text>
                    </>
                  )}

                  {/* Related concepts */}
                  {concept.related && concept.related.length > 0 && (
                    <View className="mt-3.5 flex-row flex-wrap gap-x-1.5 gap-y-1.5">
                      {concept.related.map((rid) => (
                        <RelatedChip
                          key={rid}
                          conceptId={rid}
                          experience={experience}
                          onPress={onRelated}
                        />
                      ))}
                    </View>
                  )}

                  {/* Go deeper — resources */}
                  {concept.resources && concept.resources.length > 0 && (
                    <View className="mt-4">
                      <View className="flex-row items-center mb-2.5">
                        <Icon name="book" size={13} color="#0E7A66" sw={2} />
                        <Text className="text-ink text-[12px] font-sansX uppercase tracking-wider ml-1.5">
                          Go deeper
                        </Text>
                      </View>
                      {concept.resources.map((r, i) => (
                        <View key={i} className="flex-row items-start mb-2 last:mb-0">
                          <ResourceIcon kind={r.kind} />
                          <View className="flex-1 ml-2.5">
                            <Text className="text-ink text-[13px] font-sansMd leading-[17px]">
                              {r.title}
                            </Text>
                            {r.creator && (
                              <Text className="text-ink-3 text-[11.5px] font-sansSb mt-0.5">
                                {r.creator}
                              </Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* What to learn next */}
                  {concept.nextConcept && (
                    <View className="mt-3.5">
                      <View className="flex-row items-center mb-1.5">
                        <Icon name="arrow" size={12} color="#0E7A66" sw={2.5} />
                        <Text className="text-ink text-[12px] font-sansX uppercase tracking-wider ml-1.5">
                          What to learn next
                        </Text>
                      </View>
                      <RelatedChip
                        conceptId={concept.nextConcept}
                        experience={experience}
                        onPress={onRelated}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function RelatedChip({
  conceptId,
  experience,
  onPress,
}: {
  conceptId: ConceptId;
  experience: "none" | "some" | "experienced";
  onPress: (id: ConceptId) => void;
}) {
  const concept = conceptById(conceptId);
  if (!concept) return null;

  const isReachable = isAppropriateFor(concept, experience);

  return (
    <Pressable
      onPress={() => onPress(conceptId)}
      className={
        `px-2.5 py-1.5 rounded-[9px] border ${
          isReachable
            ? "bg-brand-bg border-brand-deep/20 active:opacity-70"
            : "bg-bg-subtle border-line active:opacity-70"
        }`
      }
    >
      <Text
        className={`text-[12px] font-sansSb leading-[15px] ${
          isReachable ? "text-brand-deep" : "text-ink-3"
        }`}
      >
        {concept.term}
      </Text>
    </Pressable>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const RESOURCE_ICON: Record<string, IconName> = {
  book: "book",
  video: "compass",
  podcast: "pulse",
  course: "cap",
};

function ResourceIcon({ kind }: { kind: string }) {
  const name = RESOURCE_ICON[kind] ?? "book";
  return (
    <View className="w-[32px] h-[32px] rounded-[9px] bg-bg-subtle items-center justify-center">
      <Icon name={name} size={14} color="#4D5A54" sw={1.8} />
    </View>
  );
}
