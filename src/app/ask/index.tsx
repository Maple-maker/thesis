import { useRouter } from "expo-router";
import { useEffect } from "react";

import { useStore, selectIsPro } from "@/store";

/** Redirect Pro users straight to chat; others to paywall. */
export default function AskIndex() {
  const router = useRouter();
  const isPro = useStore(selectIsPro);

  useEffect(() => {
    if (isPro) {
      router.replace("/ask/chat");
    } else {
      router.replace("/pro");
    }
  }, [isPro, router]);

  return null;
}
