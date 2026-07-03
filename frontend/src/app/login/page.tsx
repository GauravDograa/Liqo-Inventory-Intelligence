"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Cormorant_Garamond,
  Manrope,
  Playfair_Display,
  Source_Serif_4,
} from "next/font/google";
import { Fingerprint, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "@/lib/axios";
import { defaultRouteByRole } from "@/config/roleAccess";
import { getAggregatedDashboard } from "@/services/dashboard.service";
import { usePosStore } from "@/stores/posStore";
import { UserRole } from "@/types/erp.types";

const sans = Manrope({
  subsets: ["latin"],
});

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
});

const accentSerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const roles: Array<{
  value: UserRole;
  label: string;
  hint: string;
}> = [
  { value: "OWNER", label: "Owner", hint: "Executive control" },
  { value: "ADMIN", label: "Admin", hint: "Full platform access" },
  { value: "STORE_MANAGER", label: "Store Manager", hint: "Store ops command" },
  { value: "CASHIER", label: "Cashier", hint: "POS billing" },
  { value: "WAREHOUSE_MANAGER", label: "Warehouse", hint: "Transfers and stock" },
  { value: "ANALYST", label: "Analyst", hint: "Insights and reports" },
];

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

const requestBiometricVerification = async () => {
  if (
    typeof window === "undefined" ||
    !("PublicKeyCredential" in window) ||
    !window.crypto?.getRandomValues
  ) {
    return "demo";
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 15000,
        userVerification: "preferred",
      },
    });

    return "verified";
  } catch {
    return "demo";
  }
};

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setRole = usePosStore((state) => state.setRole);

  const [selectedRole, setSelectedRole] = useState<UserRole>("ADMIN");
  const [submitting, setSubmitting] = useState(false);
  const [scanState, setScanState] = useState<"idle" | "scanning" | "verified">("idle");

  const selectedRoleDetails = useMemo(
    () => roles.find((role) => role.value === selectedRole) ?? roles[1],
    [selectedRole]
  );

  useEffect(() => {
    Object.values(defaultRouteByRole).forEach((path) => router.prefetch(path));
  }, [router]);

  const handleBiometricLogin = async () => {
    setSubmitting(true);
    setScanState("scanning");

    try {
      await requestBiometricVerification();
      setScanState("verified");
      await api.post("/auth/guest", { role: selectedRole });
      setRole(selectedRole);

      void queryClient.prefetchQuery({
        queryKey: ["dashboard"],
        queryFn: getAggregatedDashboard,
      });

      const destination = defaultRouteByRole[selectedRole];
      startTransition(() => {
        router.replace(destination);
      });
    } catch (error: unknown) {
      setScanState("idle");
      alert(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={`${sans.className} min-h-screen bg-[#f5ece5] px-3 py-3 text-slate-900 sm:px-6 sm:py-6`}>
      <div className="mx-auto mb-3 max-w-[1280px] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold leading-6 text-amber-900 shadow-sm">
        This is a demo simulation and does not represent an actual production company product.
      </div>
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1280px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] lg:min-h-[calc(100vh-3rem)] lg:grid-cols-[1.02fr_0.98fr] lg:rounded-[34px]">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#ff7a21] via-[#ef6714] to-[#d94d08] px-6 py-8 text-white sm:px-10 sm:py-10 lg:px-14 lg:py-14">
          <div className="absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-r from-transparent via-[#f38a47]/28 to-[#f7d6c3]/58 lg:block" />

          <div className="relative flex h-full flex-col justify-between">
            <div className="pt-2 text-center lg:pt-8">
              <p className={`${display.className} text-[24px] font-semibold tracking-tight sm:text-[30px] lg:text-[36px]`}>
                Welcome to
              </p>

              <div className="mx-auto mt-8 flex max-w-[220px] justify-center rounded-[24px] bg-white px-6 py-6 shadow-[0_18px_40px_rgba(0,0,0,0.08)] sm:mt-10 sm:max-w-[250px] sm:px-8 sm:py-8 lg:mt-16 lg:rounded-[28px]">
                <Image
                  src="/image.png"
                  alt="Liqo"
                  width={180}
                  height={82}
                  className="h-auto w-auto"
                />
              </div>

              <p
                className={`${accentSerif.className} mx-auto mt-8 max-w-[420px] text-[22px] leading-[1.35] text-white/95 sm:mt-10 sm:text-[24px] lg:mt-16 lg:text-[28px] lg:leading-[1.45]`}
              >
                With cleaner inventory visibility and faster transfer action,
                your team stays ahead of stock issues every day.
              </p>
            </div>

            <div className={`${sans.className} pt-8 text-sm leading-7 text-white/95 lg:pt-12`}>
              <p>
                Built for retail teams that want inventory decisions to feel
                simple, focused, and reliable.
              </p>
              <p className="mt-10 text-base font-bold tracking-[0.01em]">
                Powered by Liqo Inventory Intelligence
              </p>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#fffdfb] px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="absolute inset-y-0 left-0 hidden w-10 bg-gradient-to-r from-[#f6dbca]/42 to-transparent lg:block" />

          <div className="relative mx-auto flex h-full max-w-[460px] flex-col justify-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ffb38c] bg-[#fff5ef] px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[#eb5d1b]">
                <ShieldCheck size={14} />
                Secure Access
              </div>
              <h1 className={`${display.className} mt-4 text-[38px] font-bold leading-none text-[#eb5d1b] sm:text-[48px] lg:text-[56px]`}>
                Choose role
              </h1>
              <p className={`${serif.className} mt-3 text-base leading-7 text-slate-500 sm:text-[18px] sm:leading-8`}>
                Authenticate with thumbprint and open the workspace for your role.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {roles.map((role) => {
                const active = selectedRole === role.value;

                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    disabled={submitting}
                    className={`min-h-[82px] rounded-2xl border px-4 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-70 ${
                      active
                        ? "border-[#ff6a2a] bg-[#fff2ea] shadow-[0_12px_28px_rgba(255,106,42,0.14)]"
                        : "border-slate-200 bg-white hover:border-[#ffc2a3] hover:bg-[#fffaf7]"
                    }`}
                    aria-pressed={active}
                  >
                    <span className="block text-sm font-bold text-slate-950">
                      {role.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {role.hint}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-7 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <div className="flex items-center gap-4">
                <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-full border ${scanState === "verified" ? "border-emerald-300 bg-emerald-50 text-emerald-600" : "border-[#ffd2bd] bg-[#fff5ef] text-[#eb5d1b]"}`}>
                  <Fingerprint size={40} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                    {selectedRoleDetails.label}
                  </p>
                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {scanState === "scanning"
                      ? "Scanning thumbprint"
                      : scanState === "verified"
                        ? "Thumbprint accepted"
                        : "Ready for thumbprint"}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Opens {defaultRouteByRole[selectedRole].replace("/", "") || "dashboard"} after verification.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={submitting}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#ff6a2a] px-5 py-3 text-[16px] font-bold text-white shadow-[0_10px_25px_rgba(255,106,42,0.28)] transition hover:bg-[#f15e1e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Sparkles size={18} />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Fingerprint size={18} />
                    Authenticate thumbprint
                  </>
                )}
              </button>
            </div>

            <p className="mt-6 text-sm italic leading-7 text-slate-400">
              *Use the role assigned for your shift.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
