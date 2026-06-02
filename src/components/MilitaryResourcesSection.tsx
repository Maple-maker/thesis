import * as WebBrowser from "expo-web-browser";
import { Alert, Pressable, Text, View } from "react-native";

import { Icon } from "@/components/Icon";
import { Card } from "@/components/ui/Card";
import { SectionTitle } from "@/components/ui/SectionTitle";
import {
  militaryResourcesForStatus,
  type MilitaryResource,
} from "@/data/military-financial-resources";
import { militaryStatusLabel, type MilitaryStatus } from "@/lib/military-profile";

type Props = {
  status: MilitaryStatus;
  compact?: boolean;
  showDeploymentNote?: boolean;
};

async function openMilitaryResource(resource: MilitaryResource) {
  try {
    await WebBrowser.openBrowserAsync(resource.url, {
      toolbarColor: "#F3F5F1",
      controlsColor: "#0E7A66",
    });
  } catch {
    Alert.alert("Could not open link", resource.url);
  }
}

export function MilitaryResourcesSection({
  status,
  compact = false,
  showDeploymentNote = true,
}: Props) {
  const resources = militaryResourcesForStatus(status);
  const deployment = militaryResourcesForStatus(status, { deploymentFocus: true });

  if (resources.length === 0) return null;

  return (
    <View className={compact ? "mb-4" : "mb-6"}>
      <SectionTitle>For service members</SectionTitle>
      <Card pad={14} className="mb-3 border-brand/25 bg-brand-bg/25">
        <Text className="text-brand text-[10px] font-sansX uppercase tracking-widest mb-1">
          {militaryStatusLabel(status)} · U.S. military
        </Text>
        <Text className="text-ink text-[14px] font-sansBold leading-[20px]">
          Programs that change your investing math
        </Text>
        <Text className="text-ink-2 text-[12.5px] font-sansMd mt-2 leading-[18px]">
          SCRA, TSP/Roth TSP, SDP, combat-zone tax rules, and more, curated for
          sharing during bootstrap. Educational only; confirm eligibility on official
          sites.
        </Text>
      </Card>

      {showDeploymentNote &&
        deployment.length > 0 &&
        (status === "active" || status === "reserve") && (
          <Text className="text-ink-3 text-[11px] font-sansMd mb-2 leading-[16px]">
            Deployed or heading overseas? Start with SDP and CZTE, then TSP.
          </Text>
        )}

      <View className="gap-y-2">
        {resources.map((r) => (
          <ResourceRow key={r.id} resource={r} compact={compact} />
        ))}
      </View>

      <Text className="text-ink-3 text-[10px] font-sansMd mt-3 leading-[14px]">
        Not affiliated with DoD, TSP, or VA. Rules change, use official sources before
        decisions.
      </Text>
    </View>
  );
}

function ResourceRow({
  resource,
  compact,
}: {
  resource: MilitaryResource;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={() => openMilitaryResource(resource)}
      className="flex-row items-start bg-bg-surface border border-line rounded-[14px] px-3.5 py-3 active:opacity-75"
    >
      <View className="w-[44px] h-[44px] rounded-[11px] bg-brand/12 items-center justify-center mr-3">
        <Text className="text-brand font-monoBold text-[11px]">{resource.acronym}</Text>
      </View>
      <View className="flex-1 min-w-0 pr-2">
        <Text className="text-ink font-sansBold text-[14px] leading-[19px]">
          {resource.title}
        </Text>
        {!compact && (
          <Text className="text-ink-2 text-[12px] font-sansMd mt-1 leading-[17px]">
            {resource.summary}
          </Text>
        )}
        <Text className="text-brand text-[11.5px] font-sansMd mt-1.5 leading-[16px]">
          {resource.thesisAngle}
        </Text>
        <Text className="text-ink-3 text-[10px] font-sansMd mt-1">{resource.source}</Text>
      </View>
      <Icon name="arrow" size={14} color="#8C988F" sw={2} />
    </Pressable>
  );
}
