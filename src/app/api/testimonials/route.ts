import { NextResponse } from 'next/server';
import { createClient } from 'next-sanity';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim().slice(0, 60);
    const text = String(body.text || '').trim().slice(0, 600);
    const rating = Number(body.rating);

    // Honeypot anti-spam: campo invisível que humanos não preenchem
    if (body.website) return NextResponse.json({ success: true });

    if (!name || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    }

    let savedToSanity = false;
    const token = process.env.SANITY_API_WRITE_TOKEN;

    if (token) {
      try {
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
        savedToSanity = true;
      } catch (sanityError) {
        console.error('Erro ao salvar no Sanity com o token:', sanityError);
      }
    }

    // Envia notificação por e-mail para você (utiliza as credenciais já configuradas no site)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: 'arturdiasr@gmail.com',
          subject: `Nova Avaliação de Cliente: ${name} (${rating}/5 estrelas)`,
          text: `Você recebeu uma nova avaliação pelo site!\n\nCliente: ${name}\nNota: ${stars} (${rating}/5)\nDepoimento: ${text || '(Sem texto adicional)'}\n\n${
            savedToSanity
              ? 'O depoimento já foi salvo no Sanity Studio em "Depoimentos de Clientes" e aguarda sua aprovação para aparecer na página inicial.'
              : 'Para exibir na página inicial, você pode copiar este depoimento e cadastrá-lo manualmente no Sanity Studio em "Depoimentos de Clientes".'
          }`,
          html: `
            <h2>Nova Avaliação de Cliente</h2>
            <p><strong>Cliente:</strong> ${name}</p>
            <p><strong>Nota:</strong> <span style="color: #f59e0b; font-size: 18px;">${stars}</span> (${rating}/5)</p>
            <p><strong>Depoimento:</strong></p>
            <blockquote style="background: #f9f9f9; padding: 12px; border-left: 4px solid #111; font-style: italic;">
              ${text ? text.replace(/\n/g, '<br/>') : '<em>(Sem texto adicional)</em>'}
            </blockquote>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              ${
                savedToSanity
                  ? 'Salvo automaticamente no Sanity Studio (aguardando aprovação na aba "Depoimentos de Clientes").'
                  : 'Acesse o Sanity Studio para cadastrar este depoimento em "Depoimentos de Clientes" quando quiser exibi-lo na home.'
              }
            </p>
          `,
        });
      } catch (emailError) {
        console.error('Erro ao enviar e-mail de notificação de depoimento:', emailError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro geral ao processar depoimento:', error);
    return NextResponse.json({ error: 'Erro ao processar depoimento.' }, { status: 500 });
  }
}
