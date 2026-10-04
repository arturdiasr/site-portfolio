import React, { useState } from 'react'
import { useFormValue, type StringInputProps } from 'sanity'

/** Mensagem privada (não salva) para copiar e enviar ao cliente com o link de entrega */
export function DeliveryMessageInput(_props: StringInputProps) {
  const title = useFormValue(['title']) as string | undefined
  const slug = useFormValue(['slug']) as { current?: string } | undefined
  const days = 14 // validade fixa, igual à da página de entrega
  const [copied, setCopied] = useState(false)

  if (!slug?.current) {
    return <p style={{ color: '#888', fontSize: 13 }}>A mensagem aparecerá aqui quando o link de entrega for gerado.</p>
  }

  const firstName = title?.trim().split(/\s+/)[0]
  const link = `${window.location.origin}/entrega/${slug.current}`
  const message = `Olá${firstName ? `, ${firstName}` : ''}! 📸

Suas fotos finais estão prontas! 🎉

🔗 Baixe aqui: ${link}

⏳ O link fica disponível por ${days} dias, então faça o download com calma, mas não deixe passar do prazo.

Espero que você ame o resultado!`

  const copy = async () => {
    await navigator.clipboard.writeText(message)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <textarea readOnly value={message} rows={11} style={{ padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: 13, fontFamily: 'inherit' }} />
      <button
        type="button"
        onClick={copy}
        style={{ background: copied ? '#22c55e' : '#25D366', color: '#fff', border: 'none', borderRadius: 4, padding: '12px 14px', fontWeight: 600, cursor: 'pointer' }}
      >
        {copied ? '✓ Mensagem copiada!' : '📋 Copiar mensagem para WhatsApp'}
      </button>
    </div>
  )
}
