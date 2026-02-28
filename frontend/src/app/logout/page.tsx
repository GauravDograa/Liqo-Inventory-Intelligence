"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { queryClient } from "@/lib/react-query";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        // Call backend logout (optional but recommended)

      } catch (error) {
        console.warn("Logout API failed, continuing...");
      }

      // Clear client state
      localStorage.clear();
      sessionStorage.clear();
      queryClient.clear();

      // Redirect to login
      router.replace("/login");
    };

    logout();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white rounded-3xl p-10 shadow-xl text-center space-y-4">
        <h1 className="text-xl font-semibold text-slate-800">
          Logging you out...
        </h1>
        <p className="text-slate-500 text-sm">
          Please wait while we securely end your session.
        </p>
      </div>
    </div>
  );
}