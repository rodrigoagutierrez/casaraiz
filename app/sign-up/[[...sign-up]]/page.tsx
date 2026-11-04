import { SignUp } from "@clerk/nextjs";
import SignUpTracker from "./SignUpTracker";

import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mar-50">
      <SignUpTracker />
      <SignUp />
    </div>
  );
}
