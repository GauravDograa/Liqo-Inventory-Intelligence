import { NextResponse } from "next/server";

const maskUrl = (value: string) => {
  try {
    const url = new URL(value);
    return `${url.protocol}//${url.host}${url.pathname}`;
  } catch {
    return "invalid-url";
  }
};

export async function GET() {
  const webhookUrl = process.env.N8N_ANALYTICS_CHAT_WEBHOOK_URL;

  return NextResponse.json({
    nodeEnv: process.env.NODE_ENV || "unknown",
    webhookConfigured: Boolean(webhookUrl),
    webhookPreview: webhookUrl ? maskUrl(webhookUrl) : null,
  });
}
