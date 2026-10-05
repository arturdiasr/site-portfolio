import React, { useState } from 'react'
import { useFormValue, type StringInputProps } from 'sanity'

/** Mensagem privada (não salva) para copiar e enviar ao cliente com o link de entrega */
export function DeliveryMessageInput(_props: StringInputProps) {
  const title = useFormValue(['title']) as string | undefined
  const slug = useFormValue(['slug']) as { current?: string } | undefined
  const [copiedMessage, setCopiedMessage] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  if (!slug?.current) {
    return <p style={{ color: '#888', fontSize: 13 }}>A mensagem aparecerá aqui quando o link de entrega for gerado.</p>
  }

  const firstName = title?.trim().split(/\s+/)[0]
  const link = `${window.location.origin}/entrega/${slug.current}`
  const message = `Olá${firstName ? `, ${firstName}` : ''}! 📸

Suas fotos finais estão prontas! 🎉

🔗 Baixe aqui: ${link}

Espero que você goste do resultado!
O link ficará disponível para download por 7 dias.`

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message)
    setCopiedMessage(true)
    setTimeout(() => setCopiedMessage(false), 3000)
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <textarea readOnly value={message} rows={10} style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: 13, fontFamily: 'inherit' }} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={copyMessage}
          style={{
            flex: 1,
            minWidth: 220,
            background: copiedMessage ? '#22c55e' : '#25D366',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '12px 14px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {copiedMessage ? '✓ Mensagem copiada!' : '📋 Copiar mensagem para WhatsApp'}
        </button>
        <button
          type="button"
          onClick={copyLink}
          style={{
            background: copiedLink ? '#22c55e' : '#111827',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '12px 16px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
        >
          {copiedLink ? '✓ Link copiado!' : '🔗 Copiar link de download'}
        </button>
      </div>
    </div>
  )
}
