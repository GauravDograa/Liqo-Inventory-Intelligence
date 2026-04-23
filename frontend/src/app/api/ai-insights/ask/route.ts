import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { AiInsightsAnswer } from "@/types/insights.types";

const backendApiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v2";

const buildSuccessResponse = (
  answer: string,
  source: AiInsightsAnswer["source"]
) =>
  NextResponse.json({
    success: true,
    data: {
      answer,
      source,
    } satisfies AiInsightsAnswer,
  });

const extractAnswer = (payload: unknown): string | null => {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const nestedAnswer = extractAnswer(item);
      if (nestedAnswer) {
        return nestedAnswer;
      }
    }

    return null;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const candidateKeys = [
      "answer",
      "response",
      "output",
      "message",
      "text",
      "content",
    ];

    for (const key of candidateKeys) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }

    const nestedKeys = ["data", "result", "body", "json"];

    for (const key of nestedKeys) {
      const nestedAnswer = extractAnswer(record[key]);
      if (nestedAnswer) {
        return nestedAnswer;
      }
    }
  }

  return null;
};

const extractErrorMessage = (payload: unknown): string | null => {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim();
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const message = record.message;

    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  return null;
};

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.N8N_ANALYTICS_CHAT_WEBHOOK_URL;
  const body = (await request.json()) as { question?: string };
  const question = body.question?.trim();

  if (!question) {
    return NextResponse.json(
      { message: "Question is required." },
      { status: 400 }
    );
  }

  if (webhookUrl) {
    try {
      const webhookResponse = await axios.post(
        webhookUrl,
        {
          question,
          message: question,
          query: question,
          source: "liqo-web-app",
          timestamp: new Date().toISOString(),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

      const answer = extractAnswer(webhookResponse.data);

      if (answer) {
        return buildSuccessResponse(answer, "n8n");
      }
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        return NextResponse.json(
          { message: "The analytics webhook request failed." },
          { status: 502 }
        );
      }
    }
  }

  try {
    const backendResponse = await axios.post(
      `${backendApiBaseUrl}/insights/ask`,
      { question },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        timeout: 30000,
        withCredentials: true,
      }
    );

    const answer =
      extractAnswer(backendResponse.data?.data) ||
      extractAnswer(backendResponse.data);

    if (!answer) {
      return NextResponse.json(
        { message: "The fallback AI service did not include an answer." },
        { status: 502 }
      );
    }

    return buildSuccessResponse(answer, "fallback");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data;
      const message =
        extractErrorMessage(payload) ||
        extractAnswer(payload) ||
        error.message ||
        "The analytics services are currently unavailable.";

      return NextResponse.json(
        { message },
        { status: error.response?.status || 502 }
      );
    }

    return NextResponse.json(
      { message: "The analytics services are currently unavailable." },
      { status: 502 }
    );
  }
}
