"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      await api.post("/auth/logout");
      router.push("/login");
    };

    logout();
  }, []);

  return <div className="p-10">Logging out...</div>;
}