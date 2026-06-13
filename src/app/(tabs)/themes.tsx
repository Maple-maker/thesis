import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { Screen } from "@/components/ui/Screen";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { PersonaCard, PersonaHero } from "@/components/ui/ThesisPersonaCard";
import { THEMES, themeById } from "@/data/themes";
import { personaForTheme } from "@/data/thesis-personas";
import { useStore } from "@/store";

export default function ThemesScreen() {
  const router = useRouter();
  const themeIds = useStore((s) => s.themeIds);
  const [search, setSearch] = useState("");

  const allThemes = THEMES;
  const yourThemes = themeIds.map((id) => themeById(id)!).filter(Boolean);
  const featured = yourThemes[0];
  const featuredPersona = featured ? personaForTheme(featured.id) : undefined;

  const filtered = search.trim()
    ? allThemes.filter((t) => {
        const p = personaForTheme(t.id);
        const q = search.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.kicker.toLowerCase().includes(q) ||
          (p?.philosophy ?? "").toLowerCase().includes(q) ||
          (p?.personaName ?? "").toLowerCase().includes(q) ||
          (p?.tagline ?? "").toLowerCase().includes(q) ||
          t.drivers.some((d) => d.toLowerCase().includes(q))
        );
      })
    : allThemes;

  return (
    <Screen padded>
      <View className="pt-4 mb-5">
          <Text
            className="text-ink font-displayX text-[28px]"
            style={{ letterSpacing: -0.6, lineHeight: 32 }}
          >
            Thesis Library
          </Text>
          <Text className="text-ink-2 text-[14.5px] font-sansMd mt-1 leading-[20px]">
            12 investment philosophies — each a complete way of seeing markets.
          </Text>
        </View>

        {/* Search */}
        <View className="flex-row items-center bg-bg-surface border border-line rounded-[15px] px-4 py-3 mb-5">
          <TextInput
            className="flex-1 text-ink text-[14px] font-sansMd"
            placeholder="Filter by name, philosophy, or sector…"
            placeholderTextColor="#8C988F"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} className="ml-2">
              <Text className="text-brand text-[13px] font-sansBold">Clear</Text>
            </Pressable>
          )}
        </View>

        {/* Featured persona — user's top match */}
        {featured && featuredPersona && !search && (
          <View className="mb-6">
            <PersonaHero
              theme={featured}
              persona={featuredPersona}
              onPress={() => router.push({ pathname: "/(tabs)/builder/[id]", params: { id: featured.id } })}
            />
          </View>
        )}

        {/* Filtered results count */}
        {search.trim() && (
          <Text className="text-ink-3 text-[12px] font-sansSb mb-3">
            {filtered.length} {filtered.length === 1 ? "match" : "matches"} for "{search.trim()}"
          </Text>
        )}

        {/* Grid — all personas */}
        {!search && yourThemes.length > 0 && (
          <View className="mb-5">
            <SectionTitle>Your theses</SectionTitle>
            <View className="flex-row flex-wrap gap-x-2.5 gap-y-2.5">
              {yourThemes.map((t) => {
                const p = personaForTheme(t.id);
                if (!p) return null;
                return (
                  <View key={t.id} style={{ width: "48%" }}>
                    <PersonaCard
                      theme={t}
                      persona={p}
                      onPress={() => router.push({ pathname: "/(tabs)/builder/[id]", params: { id: t.id } })}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Grid — library */}
        {!search && (
          <View>
            <SectionTitle>
              {yourThemes.length > 0 ? "Full library" : "Browse the library"}
            </SectionTitle>
            <View className="flex-row flex-wrap gap-x-2.5 gap-y-2.5">
              {allThemes.map((t) => {
                const p = personaForTheme(t.id);
                if (!p) return null;
                return (
                  <View key={t.id} style={{ width: "48%" }}>
                    <PersonaCard
                      theme={t}
                      persona={p}
                      onPress={() => router.push({ pathname: "/(tabs)/builder/[id]", params: { id: t.id } })}
                    />
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Search results — grid */}
        {search.trim() && (
          <View className="flex-row flex-wrap gap-x-2.5 gap-y-2.5">
            {filtered.map((t) => {
              const p = personaForTheme(t.id);
              if (!p) return null;
              return (
                <View key={t.id} style={{ width: "48%" }}>
                  <PersonaCard
                    theme={t}
                    persona={p}
                    onPress={() => router.push({ pathname: "/(tabs)/builder/[id]", params: { id: t.id } })}
                  />
                </View>
              );
            })}
          </View>
        )}
      <Text className="text-ink-3 text-[11px] text-center font-sansMd mt-6 mb-2">
        Educational only · not investment advice
      </Text>
    </Screen>
  );
}
