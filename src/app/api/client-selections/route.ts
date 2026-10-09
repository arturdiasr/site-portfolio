import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { client as readClient } from '@/sanity/lib/client';

export async function POST(req: Request) {
  try {
    const token =
      process.env.SANITY_API_WRITE_TOKEN ||
      process.env.SANITY_TOKEN ||
      process.env.SANITY_API_TOKEN;

    if (!token) {
      console.warn('SANITY_API_WRITE_TOKEN não configurado.');
      return NextResponse.json({ error: 'Token de escrita não configurado no servidor' }, { status: 500 });
    }

    const body = await req.json();
    const { albumSlug, albumTitle, clientEmail, selectedFiles, status } = body;

    if (!albumSlug) {
      return NextResponse.json({ error: 'albumSlug é obrigatório' }, { status: 400 });
    }

    const writeClient = createClient({
      projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0rdhamr8',
      dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
      apiVersion: '2024-01-01',
      useCdn: false,
      token,
    });

    const safeSlug = String(albumSlug).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const rawEmail = String(clientEmail || '').trim().toLowerCase();
    const emailKey = rawEmail ? rawEmail.replace(/[^a-z0-9_-]/g, '_') : 'cliente_direto';
    const docId = `selection_${safeSlug}_${emailKey}`;

    const files = Array.isArray(selectedFiles) ? selectedFiles.map(String) : [];
    const currentStatus = status === 'submitted' ? 'submitted' : 'in_progress';
    const now = new Date().toISOString();

    const docData: any = {
      _id: docId,
      _type: 'clientSelection',
      albumSlug: String(albumSlug),
      albumTitle: String(albumTitle || albumSlug),
      clientEmail: rawEmail || '',
      selectedFiles: files,
      photoCount: files.length,
      status: currentStatus,
      lastActivityAt: now,
    };

    if (currentStatus === 'submitted') {
      docData.submittedAt = now;
    }

    await writeClient.createOrReplace(docData);

    return NextResponse.json({ success: true, count: files.length });
  } catch (error) {
    console.error('Erro ao salvar seleção de fotos:', error);
    return NextResponse.json({ error: 'Erro ao salvar seleção' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const albumSlug = searchParams.get('albumSlug');

    if (!albumSlug) {
      return NextResponse.json({ error: 'albumSlug é obrigatório' }, { status: 400 });
    }

    const selections = await readClient.fetch(
      `*[_type == "clientSelection" && albumSlug == $albumSlug] | order(lastActivityAt desc) {
        _id,
        albumTitle,
        albumSlug,
        clientEmail,
        status,
        photoCount,
        selectedFiles,
        lastActivityAt,
        submittedAt
      }`,
      { albumSlug }
    );

    return NextResponse.json({ selections });
  } catch (error) {
    console.error('Erro ao buscar seleções:', error);
    return NextResponse.json({ error: 'Erro ao buscar seleções' }, { status: 500 });
  }
}
