import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { albumTitle, clientName, selectedFiles } = await req.json();

    if (!selectedFiles || selectedFiles.length === 0) {
      return NextResponse.json({ error: 'Nenhuma foto selecionada.' }, { status: 400 });
    }

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
      subject: `Seleção de Fotos: ${albumTitle}`,
      text: `O cliente finalizou a seleção de fotos do ensaio "${albumTitle}".\n\nQuantidade: ${selectedFiles.length} fotos.\n\nLista para o Lightroom:\n${fileList}`,
      html: `
        <h2>Seleção de Fotos: ${albumTitle}</h2>
        <p>O cliente finalizou a seleção de fotos.</p>
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
