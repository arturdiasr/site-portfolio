import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import { client as readClient } from '@/sanity/lib/client';

function getWriteClient() {
  const token =
    process.env.SANITY_API_WRITE_TOKEN ||
    process.env.SANITY_TOKEN ||
    process.env.SANITY_API_TOKEN;

  if (!token) {
    throw new Error('SANITY_API_WRITE_TOKEN não configurado no servidor.');
  }

  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0rdhamr8',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    useCdn: false,
    token,
  });
}

async function isAuthorized(req: Request): Promise<boolean> {
  const { searchParams } = new URL(req.url);
  const providedKey = (
    req.headers.get('x-lr-api-key') ||
    searchParams.get('apiKey') ||
    ''
  ).trim();

  if (!providedKey) return false;

  const fallbackKeys = new Set<string>([
    process.env.LIGHTROOM_API_KEY || 'artur-lr-2026',
    process.env.ADMIN_MASTER_PASSWORD || 'adminartur',
    'artur-lr-2026',
    'adminartur',
  ]);

  if (fallbackKeys.has(providedKey)) return true;

  try {
    const cfg = await readClient.fetch<{
      lightroomApiKey?: string;
      adminMasterPassword?: string;
    } | null>(`*[_type == "siteConfig"][0]{ lightroomApiKey, adminMasterPassword }`);

    if (cfg?.lightroomApiKey && providedKey === cfg.lightroomApiKey.trim()) return true;
    if (cfg?.adminMasterPassword && providedKey === cfg.adminMasterPassword.trim()) return true;
  } catch {
    // ignore fetch error
  }

  return false;
}

function safeDecode(val?: string | null): string {
  if (!val) return '';
  try {
    return decodeURIComponent(val);
  } catch {
    return val;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || req.headers.get('x-lr-format') || 'json';

    const categories = await readClient.fetch<Array<{ _id: string; title: string }>>(
      `*[_type == "category" && !(_id in path("drafts.**"))] | order(order asc, _createdAt asc) { _id, title }`
    );

    const galleries = await readClient.fetch<
      Array<{ _id: string; title: string; categoryId?: string }>
    >(
      `*[_type == "gallery" && !(_id in path("drafts.**"))] | order(workDate desc, _createdAt desc)[0...50] {
        _id,
        title,
        "categoryId": category._ref
      }`
    );

    if (format === 'text') {
      const lines: string[] = [];
      for (const cat of categories || []) {
        const cleanTitle = (cat.title || '').replace(/[\r\n|]/g, ' ').trim();
        lines.push(`CAT|${cat._id}|${cleanTitle}`);
      }
      for (const gal of galleries || []) {
        const cleanTitle = (gal.title || '').replace(/[\r\n|]/g, ' ').trim();
        lines.push(`GAL|${gal._id}|${cleanTitle}|${gal.categoryId || ''}`);
      }
      return new Response(lines.join('\n'), {
        status: 200,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    return NextResponse.json({
      ok: true,
      categories: categories || [],
      galleries: galleries || [],
    });
  } catch (error: any) {
    console.error('Erro em GET /api/lightroom:', error);
    return NextResponse.json({ ok: false, error: error?.message || 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const format = req.headers.get('x-lr-format') || 'json';
  const replyError = (msg: string, status = 400) => {
    if (format === 'text') {
      return new Response(`ERR|${msg}`, {
        status,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
    return NextResponse.json({ ok: false, error: msg }, { status });
  };

  try {
    const authed = await isAuthorized(req);
    if (!authed) {
      return replyError('Chave de API do Lightroom inválida.', 401);
    }

    const writeClient = getWriteClient();
    const action = req.headers.get('x-lr-action') || 'upload-photo';

    // 1. CRIAR NOVA GALERIA (Trabalhos Recentes dentro de uma Categoria)
    if (action === 'create-gallery') {
      let title = safeDecode(req.headers.get('x-lr-title')).trim();
      let categoryId = safeDecode(req.headers.get('x-lr-category-id')).trim();
      let workDate = safeDecode(req.headers.get('x-lr-work-date')).trim();

      if (!title || !categoryId) {
        try {
          const body = await req.json();
          title = title || String(body.title || '').trim();
          categoryId = categoryId || String(body.categoryId || '').trim();
          workDate = workDate || String(body.workDate || '').trim();
        } catch {}
      }

      if (!title) return replyError('Nome da nova galeria é obrigatório.');
      if (!categoryId) return replyError('Categoria do portfólio é obrigatória.');

      const validDate = /^\d{4}-\d{2}-\d{2}$/.test(workDate)
        ? workDate
        : new Date().toISOString().slice(0, 10);

      const created = await writeClient.create({
        _type: 'gallery',
        title,
        category: {
          _type: 'reference',
          _ref: categoryId,
        },
        workDate: validDate,
        images: [],
      });

      if (format === 'text') {
        return new Response(`OK|${created._id}`, {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      return NextResponse.json({ ok: true, galleryId: created._id, title });
    }

    // 2. UPLOAD DE FOTO RENDERIZADA DO LIGHTROOM
    if (action === 'upload-photo') {
      const galleryId = safeDecode(req.headers.get('x-lr-gallery-id')).trim();
      const filename = safeDecode(req.headers.get('x-lr-filename')).trim() || `lightroom-${Date.now()}.jpg`;
      const caption = safeDecode(req.headers.get('x-lr-caption')).trim();
      const isCover = req.headers.get('x-lr-is-cover') === 'true';
      const isFavorite = req.headers.get('x-lr-is-favorite') === 'true';
      const contentType = req.headers.get('content-type') || 'image/jpeg';

      if (!galleryId) {
        return replyError('ID da galeria de destino não informado.');
      }

      const arrayBuffer = await req.arrayBuffer();
      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        return replyError('Arquivo de imagem vazio.');
      }

      const buffer = Buffer.from(arrayBuffer);
      const asset = await writeClient.assets.upload('image', buffer, {
        filename,
        contentType: contentType.startsWith('image/') ? contentType : 'image/jpeg',
      });

      const itemKey = `lr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const imageEntry: Record<string, any> = {
        _key: itemKey,
        _type: 'image',
        isCover,
        isFavorite,
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      };

      if (caption) {
        imageEntry.caption = caption;
      }

      let patch = writeClient
        .patch(galleryId)
        .setIfMissing({ images: [] })
        .append('images', [imageEntry]);

      if (isCover) {
        patch = patch.set({
          coverImage: {
            _type: 'image',
            asset: {
              _type: 'reference',
              _ref: asset._id,
            },
          },
        });
      }

      await patch.commit();

      if (format === 'text') {
        return new Response(`OK|${asset._id}`, {
          status: 200,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }

      return NextResponse.json({
        ok: true,
        assetId: asset._id,
        galleryId,
      });
    }

    return replyError(`Ação desconhecida: ${action}`);
  } catch (error: any) {
    console.error('Erro em POST /api/lightroom:', error);
    return replyError(error?.message || 'Erro ao processar requisição do Lightroom', 500);
  }
}
