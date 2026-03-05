"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/auth/login", { email, password });
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message || "Login failed");
    }
  };

  const handleGuestLogin = async () => {
    try {
      await api.post("/auth/guest");
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* LEFT SIDE (Brand Section for Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-orange-500 items-center justify-center text-white p-12">
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-4xl font-semibold">
            Liqo
          </h1>
          <p className="text-lg opacity-90">
            Inventory Intelligence Platform for smarter retail decisions.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE LOGIN */}
      <div className="flex flex-1 items-center justify-center bg-gray-50 px-6 py-10">

        <div className="w-full max-w-md bg-white lg:shadow-xl rounded-2xl p-6 sm:p-10">

          {/* Mobile Logo */}
          <div className="flex flex-col items-center mb-6">
            <Image
              src="/image.png"
              alt="Liqo"
              width={80}
              height={40}
            />
            <h2 className="text-xl font-semibold mt-2">
              Welcome Back
            </h2>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="text-sm text-slate-600">
                Email
              </label>

              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 
                           focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm text-slate-600">
                Password
              </label>

              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 
                           focus:ring-2 focus:ring-orange-400 outline-none"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 
                         text-white py-3 rounded-xl font-medium transition"
            >
              Sign In
            </button>

            {/* Guest Login */}
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full border border-orange-500 text-orange-500 
                         hover:bg-orange-50 py-3 rounded-xl font-medium transition"
            >
              Continue as Guest
            </button>

          </form>

          {/* Footer */}
          <p className="text-xs text-center text-slate-400 mt-6">
            Smart inventory insights for modern retail
          </p>

        </div>
      </div>
    </div>
  );
}