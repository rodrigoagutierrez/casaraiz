import { SignIn } from "@clerk/nextjs";

import type { Metadata } from "next";
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mar-50">
      <SignIn />
    </div>
  );
}
