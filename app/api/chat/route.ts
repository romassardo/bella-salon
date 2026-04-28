import { NextResponse } from 'next/server';
import { chatRequestSchema } from '@/lib/validation/schemas';
import { postToN8n } from '@/lib/n8n/client';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 422 });
  }

  const result = await postToN8n<{ text?: string; booked?: boolean; error?: string }>(
    '/chat',
    parsed.data,
  );
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const text = result.data?.text?.trim() ?? '';
  if (!text) {
    return NextResponse.json({ error: 'Respuesta vacía de Bella' }, { status: 502 });
  }

  return NextResponse.json({ text, booked: result.data?.booked === true });
}
