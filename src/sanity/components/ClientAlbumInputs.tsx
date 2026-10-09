import React, { useState } from 'react'
import { set, unset, useFormValue, type StringInputProps } from 'sanity'

// Caracteres sem ambiguidade (sem 0/O, 1/I/L) para facilitar a digitação pelo cliente
const CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generatePassword(length: number) {
  const values = new Uint32Array(length)
  crypto.getRandomValues(values)
  return Array.from(values, (v) => CHARS[v % CHARS.length]).join('')
}

const btn: React.CSSProperties = {
  padding: '8px 14px',
  border: '1px solid #ccc',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 13,
}

/** Campo de senha com botões para gerar automaticamente 5 ou 6 caracteres */
export function PasswordInput(props: StringInputProps) {
  const { value, onChange, elementProps } = props

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input
        {...elementProps}
        type="text"
        value={value || ''}
        onChange={(e) => {
          const v = e.currentTarget.value
          onChange(v ? set(v) : unset())
        }}
        style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: 16, letterSpacing: 2 }}
      />
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" style={btn} onClick={() => onChange(set(generatePassword(5)))}>
          🎲 Gerar senha de 5
        </button>
        <button type="button" style={btn} onClick={() => onChange(set(generatePassword(6)))}>
          🎲 Gerar senha de 6
        </button>
      </div>
    </div>
  )
}

/** Mensagem privada (apenas no Studio, não é salva) para copiar e enviar ao cliente via WhatsApp */
export function WhatsappMessageInput(_props: StringInputProps) {
  const title = useFormValue(['title']) as string | undefined
  const slug = useFormValue(['slug']) as { current?: string } | undefined
  const password = useFormValue(['password']) as string | undefined
  const images = useFormValue(['images']) as unknown[] | undefined
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedName, setCopiedName] = useState(false)
  const [copiedPassword, setCopiedPassword] = useState(false)

  if (!slug?.current || !password || !images || images.length === 0) {
    return (
      <p style={{ color: '#888', fontSize: 13 }}>
        A mensagem para o cliente aparecerá aqui assim que o álbum tiver link, senha e fotos.
      </p>
    )
  }

  const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/cliente/${slug.current}`
  const firstName = title?.trim().split(/\s+/)[0]
  const galleryName = title?.trim() || ''

  const message = `Olá${firstName ? `, ${firstName}` : ''}! 📸

Sua galeria de fotos está pronta! 🎉

📁 Nome da Galeria:
${galleryName}

🔑 Senha:
${password}

🔗 Link de acesso:
${link}

Como escolher suas fotos:
1️⃣ Entre no link (ou acesse a aba Área do Cliente em nosso site).
2️⃣ Digite a senha e informe seu e-mail para acompanhar suas fotos.
3️⃣ Clique em uma foto para ampliar e analisar com calma.
4️⃣ Toque no coração ❤️ no canto da foto (ou dentro da foto ampliada) para favoritar.
5️⃣ Acompanhe suas escolhidas na aba lateral.
6️⃣ Quando terminar, clique em "Enviar Lista de Fotos".

Pronto! Eu recebo a sua seleção e começo a edição das fotos escolhidas.`

  const copy = async () => {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 3000)
  }

  const copyName = async () => {
    await navigator.clipboard.writeText(galleryName)
    setCopiedName(true)
    setTimeout(() => setCopiedName(false), 3000)
  }

  const copyPassword = async () => {
    await navigator.clipboard.writeText(password)
    setCopiedPassword(true)
    setTimeout(() => setCopiedPassword(false), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <textarea
        readOnly
        value={message}
        rows={18}
        style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: 13, fontFamily: 'inherit' }}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={copy}
          style={{ ...btn, flex: 1, minWidth: 200, background: copied ? '#22c55e' : '#25D366', color: '#fff', border: 'none', padding: '12px 14px' }}
        >
          {copied ? '✓ Mensagem copiada!' : '📋 Copiar mensagem para WhatsApp'}
        </button>
        <button
          type="button"
          onClick={copyName}
          style={{ ...btn, background: copiedName ? '#22c55e' : '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', padding: '12px 14px' }}
        >
          {copiedName ? '✓ Nome copiado!' : '📁 Copiar apenas Nome'}
        </button>
        <button
          type="button"
          onClick={copyPassword}
          style={{ ...btn, background: copiedPassword ? '#22c55e' : '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', padding: '12px 14px' }}
        >
          {copiedPassword ? '✓ Senha copiada!' : '🔑 Copiar Senha'}
        </button>
        <button
          type="button"
          onClick={copyLink}
          style={{ ...btn, background: copiedLink ? '#22c55e' : '#111827', color: '#fff', border: 'none', padding: '12px 14px' }}
        >
          {copiedLink ? '✓ Link copiado!' : '🔗 Copiar Link'}
        </button>
      </div>
    </div>
  )
}
