import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { pushRoute } from "@/lib/app-route";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp } from "react-native-reanimated";

import { GoDeeperVideos } from "@/components/GoDeeperVideos";
import { MacroMarketsCard } from "@/components/macro/MacroMarketsCard";
import { Icon, type IconName } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { conceptById, type Concept, type ConceptId, type ConceptTier } from "@/data/concepts";
import { youtubeForConcept } from "@/data/youtube-resources";
import { isAppropriateFor, conceptsForExperience } from "@/lib/concept-filter";
import { nextLessonInCourse } from "@/lib/course-progress";
import { topRecommendedCourse } from "@/lib/course-recommendations";
import { useStore } from "@/store";

type ViewMode = "hub" | "glossary";

const TIER_META: Record<ConceptTier, { label: string; icon: IconName }> = {
  foundational: { label: "The basics", icon: "cap" },
  intermediate: { label: "Going deeper", icon: "trend" },
  advanced: { label: "Advanced", icon: "bolt" },
};

const TIER_ORDER: ConceptTier[] = ["foundational", "intermediate", "advanced"];

// ─────────────────────────────────────────────────────────────────────────────
// Hub
// ─────────────────────────────────────────────────────────────────────────────

function HubView({
  onNavigate,
  embedded = false,
}: {
  onNavigate: (v: ViewMode) => void;
  embedded?: boolean;
}) {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const completedLessons = useStore((s) => s.completedLessons);
  const recommended = useMemo(() => topRecommendedCourse(profile), [profile]);
  const nextLesson = useMemo(
    () => (recommended ? nextLessonInCourse(recommended, completedLessons) : null),
    [recommended, completedLessons]
  );

  return (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        <View>
          <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
            Learn
          </Text>
          <Text
            className="text-ink font-displayX text-[28px] mt-0.5"
            style={{ letterSpacing: -0.6, lineHeight: 31 }}
          >
            Education
          </Text>
        </View>
        {!embedded && (
          <Pressable
            onPress={() => router.back()}
            className="w-[40px] h-[40px] rounded-full bg-bg-surface border border-line items-center justify-center active:opacity-70"
          >
            <Icon name="close" size={18} color="#16201C" sw={2} />
          </Pressable>
        )}
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-ink-2 text-[14.5px] font-sansMd leading-[21px] mb-6">
          Build your knowledge, short lessons, plain-English explainers, and answers framed by your profile.
        </Text>

        <MacroMarketsCard />

        {recommended && (
          <Pressable
            onPress={() =>
              nextLesson
                ? router.push(`/courses/${recommended.id}/${nextLesson.lessonId}` as any)
                : router.push(`/courses/${recommended.id}` as any)
            }
            className="mb-4 active:opacity-70"
          >
            <Card pad={16} className="border-brand/30 bg-brand-bg/40">
              <Text className="text-brand text-[10px] font-sansX uppercase tracking-widest mb-1">
                {nextLesson ? "Start here" : "Continue learning"}
              </Text>
              <Text className="text-ink font-displayX text-[17px] mb-1">{recommended.title}</Text>
              <Text className="text-ink-2 text-[13px] font-sansMd">
                {nextLesson ? `Next: ${nextLesson.title}` : "View syllabus"}
              </Text>
            </Card>
          </Pressable>
        )}

        {/* Ask Thesis */}
        <Pressable
          onPress={() => pushRoute(router, "/ask")}
          className="mb-3 active:opacity-70"
        >
          <Card pad={18}>
            <View className="flex-row items-start">
              <View className="w-[44px] h-[44px] rounded-[13px] bg-brand-bg items-center justify-center mr-3.5">
                <Icon name="sparkle" size={22} color="#0E7A66" sw={2} />
              </View>
              <View className="flex-1">
                <Text className="text-ink font-displayX text-[17px] mb-1">Ask Thesis</Text>
                <Text className="text-ink-2 text-[13px] font-sansMd leading-[18px]">
                  Questions answered in plain English, framed by your profile.
                </Text>
              </View>
              <Icon name="chev" size={16} color="#8C988F" sw={2} />
            </View>
          </Card>
        </Pressable>

        {/* Courses */}
        <Pressable
          onPress={() => pushRoute(router, "/courses")}
          className="mb-3 active:opacity-70"
        >
          <Card pad={18}>
            <View className="flex-row items-start">
              <View className="w-[44px] h-[44px] rounded-[13px] bg-amber-bg items-center justify-center mr-3.5">
                <Icon name="book" size={22} color="#D98512" sw={2} />
              </View>
              <View className="flex-1">
                <Text className="text-ink font-displayX text-[17px] mb-1">Courses</Text>
                <Text className="text-ink-2 text-[13px] font-sansMd leading-[18px]">
                  Short lessons, credit, compounding, Roth IRA, stocks & ETFs.
                </Text>
              </View>
              <Icon name="chev" size={16} color="#8C988F" sw={2} />
            </View>
          </Card>
        </Pressable>

        {/* Glossary */}
        <Pressable
          onPress={() => onNavigate("glossary")}
          className="mb-3 active:opacity-70"
        >
          <Card pad={18}>
            <View className="flex-row items-start">
              <View className="w-[44px] h-[44px] rounded-[13px] bg-violet-bg items-center justify-center mr-3.5">
                <Icon name="grid" size={22} color="#7C3AED" sw={2} />
              </View>
              <View className="flex-1">
                <Text className="text-ink font-displayX text-[17px] mb-1">Glossary</Text>
                <Text className="text-ink-2 text-[13px] font-sansMd leading-[18px]">
                  Tap any term for a full explainer, 40+ concepts from basics to advanced.
                </Text>
              </View>
              <Icon name="chev" size={16} color="#8C988F" sw={2} />
            </View>
          </Card>
        </Pressable>

        {/* Disclaimer */}
        <View className="mt-4 mb-4">
          <Text className="text-ink-3 text-[11px] text-center font-sansMd leading-[16px]">
            Educational tool, not investment advice.
          </Text>
        </View>
      </ScrollView>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Glossary (extracted from original learn.tsx)
// ─────────────────────────────────────────────────────────────────────────────

function mergeGlossaryConcepts(
  experience: "none" | "some" | "experienced",
  extraIds: Iterable<ConceptId | null | undefined>
): Concept[] {
  const map = new Map<ConceptId, Concept>();
  for (const c of conceptsForExperience(experience)) {
    map.set(c.id, c);
  }
  for (const id of extraIds) {
    if (!id) continue;
    const c = conceptById(id);
    if (c) map.set(c.id, c);
  }
  const tierRank: Record<Concept["tier"], number> = {
    foundational: 0,
    intermediate: 1,
    advanced: 2,
  };
  return [...map.values()].sort(
    (a, b) => tierRank[a.tier] - tierRank[b.tier] || a.term.localeCompare(b.term)
  );
}

function GlossaryView({
  onBack,
  focusConceptId,
}: {
  onBack: () => void;
  focusConceptId?: ConceptId | null;
}) {
  const experience = useStore((s) => s.profile.experience);
  const [revealIds, setRevealIds] = useState<Set<ConceptId>>(new Set());
  const concepts = useMemo(
    () => mergeGlossaryConcepts(experience, [focusConceptId, ...revealIds]),
    [experience, focusConceptId, revealIds]
  );
  const [expanded, setExpanded] = useState<Set<ConceptId>>(() =>
    focusConceptId ? new Set([focusConceptId]) : new Set()
  );

  useEffect(() => {
    if (!focusConceptId) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(focusConceptId);
      return next;
    });
  }, [focusConceptId]);

  const toggleExpanded = (id: ConceptId) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const navigateToConcept = (otherId: ConceptId) => {
    if (!conceptById(otherId)) return;
    setRevealIds((prev) => {
      const next = new Set(prev);
      next.add(otherId);
      return next;
    });
    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(otherId);
      return next;
    });
  };

  return (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-2">
        <View className="flex-row items-center">
          <Pressable
            onPress={onBack}
            className="w-[36px] h-[36px] rounded-[11px] bg-bg-surface border border-line items-center justify-center mr-3 active:opacity-70"
          >
            <Icon name="back" size={16} color="#16201C" sw={2} />
          </Pressable>
          <View>
            <Text className="text-ink-3 text-[11px] font-sansX uppercase tracking-widest">
              Reference
            </Text>
            <Text
              className="text-ink font-displayX text-[28px] mt-0.5"
              style={{ letterSpacing: -0.6, lineHeight: 31 }}
            >
              Glossary
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-ink-2 text-[14.5px] font-sansMd leading-[21px] mb-6">
          Plain-English explainers for investing concepts, tap any card to read more.
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
                    onRelated={navigateToConcept}
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
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────────────────

type LearnScreenProps = {
  /** When true, used as bottom tab, no close button, tab-safe padding */
  embedded?: boolean;
};

export default function LearnScreen({ embedded = false }: LearnScreenProps) {
  const router = useRouter();
  const params = useLocalSearchParams<{ concept?: string }>();
  const [view, setView] = useState<ViewMode>("hub");
  const [focusConceptId, setFocusConceptId] = useState<ConceptId | null>(null);

  const openConceptFromParams = useCallback(() => {
    const raw = params.concept;
    if (!raw || typeof raw !== "string") return;
    const id = raw as ConceptId;
    if (!conceptById(id)) return;
    setFocusConceptId(id);
    setView("glossary");
  }, [params.concept]);

  useFocusEffect(
    useCallback(() => {
      openConceptFromParams();
    }, [openConceptFromParams])
  );

  const clearConceptParam = () => {
    setFocusConceptId(null);
    router.setParams({ concept: "" });
  };

  return (
    <SafeAreaView edges={["top", "left", "right", "bottom"]} style={{ flex: 1, backgroundColor: "#F3F5F1" }}>
      {view === "hub" ? (
        <HubView onNavigate={setView} embedded={embedded} />
      ) : (
        <GlossaryView
          focusConceptId={focusConceptId}
          onBack={() => {
            clearConceptParam();
            setView("hub");
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Concept card (unchanged from original)
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
      <Card pad={14}>
        <Pressable onPress={onToggle} className="active:opacity-85">
          <View className="flex-row items-start">
            <View
              className={`w-[3px] rounded-full mr-3 ${expanded ? "bg-brand" : "bg-line-strong"}`}
              style={{ minHeight: expanded ? 24 : 22, alignSelf: "stretch" }}
            />
            <View className="flex-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-ink text-[15px] font-sansBold flex-1 leading-[20px]">
                  {concept.term}
                </Text>
                <View style={{ transform: expanded ? [{ rotate: "180deg" }] : undefined }}>
                  <Icon name="chevDown" size={16} color="#8C988F" sw={2.2} />
                </View>
              </View>
              {!expanded && (
                <Text className="text-ink-2 text-[13px] font-sansMd mt-0.5 leading-[18px]">
                  {concept.short}
                </Text>
              )}
            </View>
          </View>
        </Pressable>

        {expanded && (
          <View className="mt-3 pl-[15px]">
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

            <GoDeeperVideos
              videos={youtubeForConcept(concept.id)}
              title="Go deeper on YouTube"
              compact
            />

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
      </Card>
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
      onPress={(e) => {
        e?.stopPropagation?.();
        onPress(conceptId);
      }}
      className={
        `px-2.5 py-1.5 rounded-[9px] border ${
          isReachable
            ? "bg-brand-bg border-brand-deep/20 active:opacity-70"
            : "bg-bg-surface2 border-line active:opacity-70"
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

