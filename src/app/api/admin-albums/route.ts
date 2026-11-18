import { NextResponse } from 'next/server';
import { client } from '@/sanity/lib/client';

async function getMasterPassword(): Promise<string> {
  try {
    const cfg = await client.fetch<{ adminMasterPassword?: string } | null>(
      `*[_type == "siteConfig"][0]{ adminMasterPassword }`
    );
    if (cfg?.adminMasterPassword && cfg.adminMasterPassword.trim().length > 0) {
      return cfg.adminMasterPassword.trim();
    }
  } catch {
    // ignore fetch error and use fallback
  }
  return (
    process.env.ADMIN_MASTER_PASSWORD ||
    process.env.NEXT_PUBLIC_ADMIN_MASTER_PASSWORD ||
    'adminartur'
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password, action = 'list' } = body;

    if (!password) {
      return NextResponse.json({ isAdmin: false, error: 'Senha obrigatória' }, { status: 400 });
    }

    const masterPassword = await getMasterPassword();
    const isAdmin = String(password).trim() === masterPassword;

    if (!isAdmin) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    if (action === 'verify') {
      return NextResponse.json({ isAdmin: true });
    }

    const albums = await client.fetch(
      `*[_type == "clientAlbum"] | order(_createdAt desc) {
        _id,
        title,
        "slug": slug.current,
        password,
        requireEmail,
        _createdAt,
        "photoCount": count(coalesce(images, [])) + count(coalesce(videos, []))
      }`
    );

    return NextResponse.json({ isAdmin: true, albums: albums || [] });
  } catch (error) {
    console.error('Erro em /api/admin-albums:', error);
    return NextResponse.json({ isAdmin: false, error: 'Erro interno' }, { status: 500 });
  }
}
