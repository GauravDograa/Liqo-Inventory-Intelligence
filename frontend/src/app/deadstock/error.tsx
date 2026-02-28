"use client";

interface Props {
  error: Error;
  reset: () => void;
}

export default function DeadstockError({ error, reset }: Props) {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
      <h2 className="text-xl font-semibold text-red-600">
        Something went wrong.
      </h2>

      <p className="text-sm text-gray-500 mt-2">
        {error.message}
      </p>

      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
      >
        Try Again
      </button>
    </div>
  );
}