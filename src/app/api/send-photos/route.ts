import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { createClient } from 'next-sanity';

export async function POST(req: Request) {
  try {
    const { albumTitle, albumSlug, clientEmail, clientName, selectedFiles } = await req.json();

    if (!selectedFiles || selectedFiles.length === 0) {
      return NextResponse.json({ error: 'Nenhuma foto selecionada.' }, { status: 400 });
    }

    const emailIdentifier = clientEmail ? String(clientEmail).trim() : (clientName ? String(clientName).trim() : '');

    // 1. Atualiza o status da seleção no Sanity caso o token esteja disponível
    const token =
      process.env.SANITY_API_WRITE_TOKEN ||
      process.env.SANITY_TOKEN ||
      process.env.SANITY_API_TOKEN;

    if (token && albumSlug) {
      try {
        const writeClient = createClient({
          projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '0rdhamr8',
          dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
          apiVersion: '2024-01-01',
          useCdn: false,
          token,
        });

        const safeSlug = String(albumSlug).trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
        const emailKey = emailIdentifier ? emailIdentifier.toLowerCase().replace(/[^a-z0-9_-]/g, '_') : 'cliente_direto';
        const docId = `selection_${safeSlug}_${emailKey}`;
        const now = new Date().toISOString();

        await writeClient.createOrReplace({
          _id: docId,
          _type: 'clientSelection',
          albumSlug: String(albumSlug),
          albumTitle: String(albumTitle || albumSlug),
          clientEmail: emailIdentifier,
          selectedFiles: selectedFiles.map(String),
          photoCount: selectedFiles.length,
          status: 'submitted',
          submittedAt: now,
          lastActivityAt: now,
        });
      } catch (err) {
        console.error('Erro ao atualizar seleção no Sanity via send-photos:', err);
      }
    }

    // 2. Envio de e-mail de notificação
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const fileList = selectedFiles.join(', ');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'arturdiasr@gmail.com',
      subject: `Seleção de Fotos: ${albumTitle}${emailIdentifier ? ` (${emailIdentifier})` : ''}`,
      text: `O cliente (${emailIdentifier || 'Não informado'}) finalizou a seleção de fotos do ensaio "${albumTitle}".\n\nE-mail do Cliente: ${emailIdentifier || 'Não informado'}\nQuantidade: ${selectedFiles.length} fotos.\n\nLista para o Lightroom:\n${fileList}`,
      html: `
        <h2>Seleção de Fotos: ${albumTitle}</h2>
        <p>O cliente finalizou a seleção de fotos e enviou para edição.</p>
        <p><strong>E-mail do Cliente:</strong> ${emailIdentifier || 'Não informado'}</p>
        <p><strong>Quantidade:</strong> ${selectedFiles.length} fotos.</p>
        <p><strong>Lista para o Lightroom:</strong></p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; font-family: monospace; word-break: break-all;">
          ${fileList}
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email enviado com sucesso.' });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json({ error: 'Erro ao enviar email.' }, { status: 500 });
  }
}
