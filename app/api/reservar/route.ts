import { NextResponse } from 'next/server';
import { reservaSchema } from '@/lib/validation/schemas';
import { postToN8n } from '@/lib/n8n/client';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = reservaSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const result = await postToN8n('/reserva', parsed.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, data: result.data });
}
