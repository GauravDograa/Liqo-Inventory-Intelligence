"use client";

import { useEffect } from "react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StorePerformanceError({ error, reset }: Props) {
  useEffect(() => {
    console.error("Store Performance Error:", error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8 max-w-lg w-full text-center">
        <div className="h-1 w-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-t-3xl mb-6" />

        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>

        <p className="text-gray-500 mb-6">
          We couldn’t load store performance data.
        </p>

        <button
          onClick={() => reset()}
          className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}