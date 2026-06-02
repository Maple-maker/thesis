import { Alert, Linking } from "react-native";

import type { YoutubeVideo } from "@/data/youtube-resources";

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export async function openYoutubeVideo(video: YoutubeVideo): Promise<void> {
  const url = youtubeWatchUrl(video.videoId);
  try {
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert("Cannot open link", "YouTube is not available on this device.");
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert("Cannot open link", "Try again or open YouTube manually.");
  }
}
