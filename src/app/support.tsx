import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { MarkdownBlock } from "@/components/MarkdownBlock";
import { Card } from "@/components/ui/Card";
import { Header } from "@/components/ui/Header";
import { Screen } from "@/components/ui/Screen";
import { supportDocuments, type SupportDocument } from "@/data/support-documents";

function DocumentCard({
  doc,
  isExpanded,
  onToggle,
}: {
  doc: SupportDocument;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="mb-3 overflow-hidden">
      <Pressable
        onPress={onToggle}
        className="px-4 py-3.5 flex-row items-center justify-between"
      >
        <View className="flex-1 mr-3">
          <Text className="text-ink font-sansSb text-[14px] leading-[18px]">
            {doc.title}
          </Text>
          <Text className="text-ink-3 font-sansMd text-[12px] leading-[17px] mt-0.5">
            {doc.description}
          </Text>
        </View>
        <View
          className="w-6 h-6 rounded-full items-center justify-center"
          style={{ backgroundColor: isExpanded ? "#0E7A66" : "#EDF0EB" }}
        >
          <Text
            className="text-[14px] font-sansX"
            style={{
              color: isExpanded ? "#FFFFFF" : "#8C988F",
              marginTop: isExpanded ? -1 : 0,
            }}
          >
            {isExpanded ? "−" : "+"}
          </Text>
        </View>
      </Pressable>
      {isExpanded && (
        <View className="px-4 pb-4 pt-0">
          <View className="h-px bg-line mb-3" />
          <MarkdownBlock content={doc.content} />
          <View className="h-4" />
        </View>
      )}
    </Card>
  );
}

export default function SupportScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Screen padded>
      <Header back onBack={() => router.back()} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <Text className="text-brand text-[11px] font-sansX uppercase tracking-widest mt-2">
          Support & Legal
        </Text>
        <Text
          className="text-ink font-displayX text-[28px] mt-1"
          style={{ letterSpacing: -0.5, lineHeight: 32 }}
        >
          Business documents
        </Text>
        <Text className="text-ink-2 text-[14px] font-sansMd mt-3 leading-[21px]">
          These documents were prepared as part of the{" "}
          <Text className="font-sansSb text-ink">Plaid integration</Text> application
          process and cover information security, data access, terms of service,
          privacy policy, and the Thesis business model.{"\n\n"}
          Tap any document to expand and read the full content.
        </Text>

        {/* Contact info card */}
        <Card className="mt-5 mb-4 px-4 py-3.5">
          <Text className="text-ink font-sansSb text-[13px]">
            Contact
          </Text>
          <Text className="text-ink-2 font-sansMd text-[13px] leading-[19px] mt-1.5">
            For questions about any of these documents, contact us at{" "}
            <Text className="font-sansSb text-ink">
              founder@makeyourthesis.com
            </Text>
            .
          </Text>
        </Card>

        {/* Feedback shortcut */}
        <Pressable
          onPress={() => router.push("/feedback" as never)}
          className="mb-4 bg-brand-bg border border-brand/20 rounded-[14px] px-4 py-3.5 flex-row items-center active:opacity-70"
        >
          <View className="w-[36px] h-[36px] rounded-[10px] items-center justify-center mr-3" style={{ backgroundColor: "rgba(14,122,102,0.15)" }}>
            <Icon name="compare" size={18} color="#0E7A66" sw={2} />
          </View>
          <View className="flex-1">
            <Text className="text-brand font-sansBold text-[14px]">Report an issue</Text>
            <Text className="text-ink-3 text-[12px] font-sansMd mt-0.5">
              Found a bug or have feedback? Let us know.
            </Text>
          </View>
          <Icon name="chev" size={18} color="#0E7A66" />
        </Pressable>

        {/* Separator */}
        <View className="flex-row items-center my-4">
          <View className="flex-1 h-px bg-line" />
          <Text className="text-ink-3 font-sansSb text-[11px] uppercase tracking-widest mx-3">
            Documents
          </Text>
          <View className="flex-1 h-px bg-line" />
        </View>

        {/* Document cards */}
        {supportDocuments.map((doc) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            isExpanded={expandedId === doc.id}
            onToggle={() => toggle(doc.id)}
          />
        ))}

        <Text className="text-ink-3 text-[11px] font-sansMd mt-2 mb-4 text-center">
          Last updated: June 2026
        </Text>
      </ScrollView>
    </Screen>
  );
}
