import { Image } from "expo-image";
import { useState } from "react";
import { View } from "react-native";

import { Tick } from "@/components/ui/Tick";

type Props = {
  ticker: string;
  /** Company website domain, e.g. "nvidia.com". Monogram fallback when absent. */
  domain?: string;
  size?: number;
};

/**
 * Company logo via the Brandfetch CDN with a ticker-monogram fallback.
 * Never throws on a missing domain or a failed fetch — it just renders Tick.
 */
export function LogoImage({ ticker, domain, size = 40 }: Props) {
  const [failed, setFailed] = useState(false);

  if (!domain || failed) {
    return <Tick ticker={ticker} size={size} />;
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#EAEDE8",
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={{ uri: `https://cdn.brandfetch.io/${domain}/icon` }}
        style={{ width: size * 0.72, height: size * 0.72 }}
        contentFit="contain"
        transition={120}
        onError={() => setFailed(true)}
      />
    </View>
  );
}
