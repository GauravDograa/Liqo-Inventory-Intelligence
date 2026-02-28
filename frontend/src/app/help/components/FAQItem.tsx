"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface Props {
  question: string;
  answer: string;
}

export default function FAQItem({ question, answer }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-xl p-4 transition-all">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="font-medium">{question}</span>
        <ChevronDown
          className={`transition-transform ${
            open ? "rotate-180" : ""
          }`}
          size={18}
        />
      </button>

      {open && (
        <p className="mt-3 text-gray-600 text-sm leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  );
}