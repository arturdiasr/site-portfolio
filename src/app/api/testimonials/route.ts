import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';

export async function POST(req: Request) {
  try {
    const token = process.env.SANITY_API_WRITE_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'Servidor não configurado.' }, { status: 500 });
    }

    const body = await req.json();
    const name = String(body.name || '').trim().slice(0, 60);
    const text = String(body.text || '').trim().slice(0, 600);
    const rating = Number(body.rating);

    // Honeypot anti-spam: campo invisível que humanos não preenchem
    if (body.website) return NextResponse.json({ success: true });

    if (!name || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    const writeClient = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0rdhamr8',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      useCdn: false,
      token,
    });

    await writeClient.create({
      _type: 'testimonial',
      name,
      rating,
      text,
      approved: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar depoimento:', error);
    return NextResponse.json({ error: 'Erro ao salvar depoimento.' }, { status: 500 });
  }
}
