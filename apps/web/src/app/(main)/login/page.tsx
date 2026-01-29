"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new sign-up page (default for new users)
    router.replace("/sign-up");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
      <div className="size-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
    </div>
  );
}
