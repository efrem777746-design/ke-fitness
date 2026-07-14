import { NextResponse } from "next/server";

type Lead = { name?: string; email?: string; messenger?: string; goal?: string; plan?: string };

export async function POST(request: Request) {
  const lead = await request.json() as Lead;
  if (!lead.name || !lead.email || !lead.messenger || !lead.plan) {
    return NextResponse.json({ error: "Заполните обязательные поля формы." }, { status: 400 });
  }

  // Keep the UI decoupled from delivery: configure any automation service here later.
  const webhookUrl = process.env.APPLICATION_WEBHOOK_URL;
  if (!webhookUrl) {
    return NextResponse.json({ error: "Приём заявок ещё не настроен." }, { status: 503 });
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...lead, submittedAt: new Date().toISOString() }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Не удалось отправить заявку. Попробуйте ещё раз." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
