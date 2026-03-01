"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const token = response.data.token;

    // Store token
    localStorage.setItem("token", token);

    router.push("/dashboard");
  } catch (error: any) {
    alert(error.message || "Login failed");
  }
};
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-orange-500 to-orange-400">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">
            Liqo Inventory Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-slate-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-2 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-2 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-medium transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}