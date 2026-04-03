"use client";

import { startTransition, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Cormorant_Garamond,
  Manrope,
  Playfair_Display,
  Source_Serif_4,
} from "next/font/google";
import { Eye, LockKeyhole, Mail } from "lucide-react";
import { api } from "@/lib/axios";
import { getAggregatedDashboard } from "@/services/dashboard.service";

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

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
};

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post("/auth/login", { email, password });
      await queryClient.prefetchQuery({
        queryKey: ["dashboard"],
        queryFn: getAggregatedDashboard,
      });
      startTransition(() => {
        router.push("/dashboard");
      });
    } catch (error: unknown) {
      alert(getErrorMessage(error) || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setGuestLoading(true);

    try {
      await api.post("/auth/guest");
      await queryClient.prefetchQuery({
        queryKey: ["dashboard"],
        queryFn: getAggregatedDashboard,
      });
      startTransition(() => {
        router.push("/dashboard");
      });
    } catch (error: unknown) {
      alert(getErrorMessage(error));
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <main className={`${sans.className} min-h-screen bg-[#f5ece5] px-4 py-4 text-slate-900 sm:px-6 sm:py-6`}>
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1280px] overflow-hidden rounded-[34px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.14)] lg:grid-cols-[1.02fr_0.98fr]">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#ff7a21] via-[#ef6714] to-[#d94d08] px-10 py-12 text-white sm:px-14 sm:py-14">
          <div className="absolute inset-y-0 right-0 hidden w-12 bg-gradient-to-r from-transparent via-[#f38a47]/28 to-[#f7d6c3]/58 lg:block" />

          <div className="relative flex h-full flex-col justify-between">
            <div className="pt-4 text-center lg:pt-8">
              <p className={`${display.className} text-[28px] font-semibold tracking-tight sm:text-[36px]`}>
                Welcome to
              </p>

              <div className="mx-auto mt-16 flex max-w-[250px] justify-center rounded-[28px] bg-white px-8 py-8 shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
                <Image
                  src="/image.png"
                  alt="Liqo"
                  width={180}
                  height={82}
                  className="h-auto w-auto"
                />
              </div>

              <p
                className={`${accentSerif.className} mx-auto mt-16 max-w-[420px] text-[28px] leading-[1.45] text-white/95`}
              >
                With cleaner inventory visibility and faster transfer action,
                your team stays ahead of stock issues every day.
              </p>
            </div>

            <div className={`${sans.className} pt-12 text-sm leading-7 text-white/95`}>
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

        <section className="relative overflow-hidden bg-[#fffdfb] px-8 py-12 sm:px-12 sm:py-14">
          <div className="absolute inset-y-0 left-0 hidden w-10 bg-gradient-to-r from-[#f6dbca]/42 to-transparent lg:block" />

          <div className="relative mx-auto flex h-full max-w-[360px] flex-col justify-center">
            <div>
              <h1 className={`${display.className} text-[50px] font-bold leading-none text-[#eb5d1b] sm:text-[58px]`}>
                Log in
              </h1>
              <p className={`${serif.className} mt-3 text-[18px] leading-8 text-slate-500`}>
                Please fill in your credentials to login.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-14 space-y-7">
              <label className="block">
                <span className="sr-only">Email</span>
                <div className="flex items-center gap-3 border-b border-slate-400 pb-3">
                  <Mail size={18} className="text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="EMP123456"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-lg text-slate-700 outline-none placeholder:text-slate-400"
                  />
                </div>
              </label>

              <label className="block">
                <span className="sr-only">Password</span>
                <div className="flex items-center gap-3 border-b border-slate-400 pb-3">
                  <LockKeyhole size={18} className="text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent text-lg text-slate-700 outline-none placeholder:text-slate-400"
                  />
                  <Eye size={18} className="text-slate-400" />
                </div>
              </label>

              <label className="flex items-center gap-2 text-sm font-medium text-[#eb5d1b]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded-[4px] border border-[#eb5d1b] accent-[#eb5d1b]"
                />
                Remember Me
              </label>

              <button
                type="submit"
                disabled={submitting || guestLoading}
                className="mt-6 w-[170px] rounded-[12px] bg-[#ff6a2a] px-6 py-3 text-center text-[18px] font-bold text-white shadow-[0_10px_25px_rgba(255,106,42,0.28)] transition hover:bg-[#f15e1e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Logging in..." : "Log in"}
              </button>

              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={submitting || guestLoading}
                className="block text-sm font-semibold text-slate-500 underline-offset-4 transition hover:text-[#eb5d1b] hover:underline disabled:opacity-60"
              >
                {guestLoading ? "Opening guest view..." : "Sign in as Guest"}
              </button>
            </form>

            <p className="mt-10 text-sm italic leading-7 text-slate-400">
              *Do not share your login credentials with anyone.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
