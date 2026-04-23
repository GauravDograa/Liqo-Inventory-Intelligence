"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Bot,
  ChevronDown,
  Loader2,
  MessageSquareText,
  SendHorizonal,
  Sparkles,
  X,
} from "lucide-react";
import { useAiInsightsSummary } from "@/hooks/useAiInsightsSummary";
import { useAskAiInsights } from "@/hooks/useAskAiInsights";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  source?: "openai" | "fallback" | "n8n";
};

type AssistantOpenDetail = {
  question?: string;
  submit?: boolean;
};

const starterPrompts = [
  "Which store needs attention first?",
  "What is driving deadstock risk right now?",
  "What should the business focus on this week?",
];

export default function FloatingAiAssistant() {
  const summaryQuery = useAiInsightsSummary();
  const askMutation = useAskAiInsights();
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "assistant-welcome",
      role: "assistant",
      content:
        "I can help with margin, deadstock, store performance, and transfer decisions across Liqo.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const prompts = useMemo(() => {
    if (summaryQuery.data?.followUpQuestions?.length) {
      return summaryQuery.data.followUpQuestions.slice(0, 3);
    }

    return starterPrompts;
  }, [summaryQuery.data]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [isOpen, messages, askMutation.isPending]);

  const handleAsk = useCallback(async (nextQuestion?: string) => {
    const trimmedQuestion = (nextQuestion ?? question).trim();

    if (!trimmedQuestion || askMutation.isPending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedQuestion,
    };

    setMessages((current) => [...current, userMessage]);
    setQuestion("");

    try {
      const response = await askMutation.mutateAsync(trimmedQuestion);

      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: response.answer,
          source: response.source,
        },
      ]);
    } catch {
      // Error UI is handled below through the mutation state.
    }
  }, [askMutation, question]);

  useEffect(() => {
    const handleOpenAssistant = (event: Event) => {
      const customEvent = event as CustomEvent<AssistantOpenDetail>;
      const nextQuestion = customEvent.detail?.question?.trim() ?? "";

      setIsOpen(true);

      if (nextQuestion) {
        setQuestion(nextQuestion);

        if (customEvent.detail?.submit) {
          void handleAsk(nextQuestion);
        }
      }
    };

    window.addEventListener("liqo-ai:open", handleOpenAssistant as EventListener);

    return () => {
      window.removeEventListener(
        "liqo-ai:open",
        handleOpenAssistant as EventListener
      );
    };
  }, [handleAsk]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await handleAsk();
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-x-3 bottom-3 z-50 sm:inset-x-auto sm:bottom-5 sm:right-5">
          <section className="ml-auto flex h-[min(78vh,44rem)] w-full max-w-[26rem] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_30px_80px_-34px_rgba(15,23,42,0.45)]">
            <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">
                    <Sparkles size={12} />
                    Liqo AI
                  </div>
                  <h2 className="mt-3 text-lg font-semibold tracking-tight">
                    Inventory copilot
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-white/70">
                    Ask about risk, margin, inventory pressure, and next actions.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/15 hover:text-white"
                    aria-label="Minimize assistant"
                    title="Minimize assistant"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMessages((current) => current.slice(0, 1))}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/80 transition hover:bg-white/15 hover:text-white"
                    aria-label="Clear conversation"
                    title="Clear conversation"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex flex-wrap gap-2">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setQuestion(prompt)}
                    className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-orange-300 hover:text-orange-600"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto bg-[linear-gradient(180deg,_#ffffff_0%,_#f8fafc_100%)] px-4 py-4"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[88%] rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm ${
                    message.role === "user"
                      ? "ml-auto bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  <p>{message.content}</p>
                  {message.source ? (
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">
                      {message.source}
                    </p>
                  ) : null}
                </div>
              ))}

              {askMutation.isPending ? (
                <div className="flex max-w-[88%] items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
                  <Loader2 size={16} className="animate-spin" />
                  Thinking through the latest signals...
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white p-4">
              {askMutation.isError ? (
                <div className="mb-3 rounded-2xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                  {askMutation.error.message || "Failed to get AI answer"}
                </div>
              ) : null}

              <div className="flex items-end gap-3">
                <textarea
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask Liqo AI about stores, margin, deadstock, or transfers..."
                  className="min-h-[4.5rem] flex-1 resize-none rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white"
                />
                <button
                  type="submit"
                  disabled={askMutation.isPending || !question.trim()}
                  className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-slate-300"
                  aria-label="Send message"
                  title="Send message"
                >
                  <SendHorizonal size={17} />
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 items-center gap-3 rounded-full bg-slate-950 px-4 text-sm font-semibold text-white shadow-[0_25px_60px_-20px_rgba(15,23,42,0.55)] transition hover:bg-slate-800"
      >
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white">
          {isOpen ? <Bot size={18} /> : <MessageSquareText size={18} />}
        </span>
        <span className="hidden sm:inline">Ask Liqo AI</span>
      </button>
    </>
  );
}
