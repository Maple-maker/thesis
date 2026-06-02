import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { isPlaidBackendReady } from "@/lib/plaid-client";
import { PlaidLinkModal } from "@/components/plaid/PlaidLinkModal";
import { MfaSetupSheet } from "@/components/mfa/MfaSetupSheet";
import { getMfaStatus } from "@/lib/mfa-client";
import type { LinkedAccount } from "@/types/linked-accounts";
import { useStore, selectPlaidConnected } from "@/store";

type Props = {
  label?: string;
  variant?: "primary" | "secondary" | "outline";
};

export function ConnectAccountsButton({
  label = "Link accounts",
  variant = "primary",
}: Props) {
  const [showPlaid, setShowPlaid] = useState(false);
  const [showMfa, setShowMfa] = useState(false);
  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const connected = useStore(selectPlaidConnected);
  const connectDemo = useStore((s) => s.connectDemoAccounts);
  const setPlaidAccounts = useStore((s) => s.setPlaidAccounts);
  const setStatus = useStore((s) => s.setPlaidStatus);
  const thesisUserId = useStore((s) => s.thesisUserId);

  // Check MFA status on mount
  useEffect(() => {
    if (!thesisUserId) return;
    getMfaStatus(thesisUserId)
      .then((s) => setMfaEnrolled(s.enrolled))
      .catch(() => setMfaEnrolled(false));
  }, [thesisUserId]);

  const onPress = () => {
    if (!isPlaidBackendReady()) {
      connectDemo();
      setStatus("demo");
      return;
    }
    // Gate: require MFA before Plaid
    if (!mfaEnrolled) {
      setShowMfa(true);
      return;
    }
    setShowPlaid(true);
  };

  const handleAccountsLinked = (accounts: LinkedAccount[]) => {
    setPlaidAccounts(accounts);
    setStatus("connected");
  };

  return (
    <>
      <Button label={connected ? "Link another account" : label} variant={variant} fullWidth onPress={onPress} />

      {/* MFA setup gate */}
      <MfaSetupSheet
        visible={showMfa}
        userId={thesisUserId}
        onClose={() => setShowMfa(false)}
        onEnrolled={() => {
          setMfaEnrolled(true);
          setShowMfa(false);
          // After MFA setup, proceed to Plaid
          setTimeout(() => setShowPlaid(true), 400);
        }}
      />

      {/* Plaid Link */}
      {showPlaid && (
        <PlaidLinkModal
          visible={showPlaid}
          userId={thesisUserId}
          onAccountsLinked={handleAccountsLinked}
          onClose={() => setShowPlaid(false)}
        />
      )}
    </>
  );
}
