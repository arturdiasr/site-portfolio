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

  if (!slug?.current || !password || !images || images.length === 0) {
    return (
      <p style={{ color: '#888', fontSize: 13 }}>
        A mensagem para o cliente aparecerá aqui assim que o álbum tiver link, senha e fotos.
      </p>
    )
  }

  const link = `${window.location.origin}/cliente/${slug.current}`
  const firstName = title?.trim().split(/\s+/)[0]
  const message = `Olá${firstName ? `, ${firstName}` : ''}! 📸

Sua galeria de fotos está pronta! 🎉

🔗 Acesse aqui: ${link}
🔑 Senha: ${password}

Como escolher suas fotos:
1️⃣ Entre no link e digite a senha.
2️⃣ Clique em uma foto para ampliar e analisar com calma.
3️⃣ Toque no coração ❤️ no canto da foto (ou dentro da foto ampliada) para favoritar.
4️⃣ Acompanhe suas escolhidas na aba lateral.
5️⃣ Quando terminar, clique em "Enviar Lista de Fotos".

Pronto! Eu recebo a sua seleção e começo a edição das fotos escolhidas.`

  const copy = async () => {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <textarea
        readOnly
        value={message}
        rows={16}
        style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: 13, fontFamily: 'inherit' }}
      />
      <button
        type="button"
        onClick={copy}
        style={{ ...btn, background: copied ? '#22c55e' : '#25D366', color: '#fff', border: 'none', padding: '12px 14px' }}
      >
        {copied ? '✓ Mensagem copiada!' : '📋 Copiar mensagem para WhatsApp'}
      </button>
    </div>
  )
}
