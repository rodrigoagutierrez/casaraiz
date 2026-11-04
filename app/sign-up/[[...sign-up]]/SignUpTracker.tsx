"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { trackEvent } from "@/shared/lib/analytics";

export default function SignUpTracker() {
  const { isSignedIn, isLoaded } = useUser();
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (sessionStorage.getItem("casaraiz_signup_tracked")) return;
    sessionStorage.setItem("casaraiz_signup_tracked", "1");
    trackEvent("sign_up", { method: "clerk" });
  }, [isLoaded, isSignedIn]);
  return null;
}
