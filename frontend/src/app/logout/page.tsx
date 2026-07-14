"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { usePosStore } from "@/stores/posStore";

export default function Logout() {
  const router = useRouter();
  const resetSession = usePosStore((state) => state.resetSession);

  useEffect(() => {
    const logout = async () => {
      try {
        await api.post("/auth/logout");
      } finally {
        resetSession();
        router.push("/login");
      }
    };

    logout();
  }, [resetSession, router]);

  return <div className="p-10">Logging out...</div>;
}
