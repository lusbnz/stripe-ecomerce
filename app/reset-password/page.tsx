import ResetPasswordClient from "@/components/reset-password-client";
import { Suspense } from "react";

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
