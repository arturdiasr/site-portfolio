import React, { useState, useEffect, useCallback } from 'react'
import { useClient, useFormValue, type StringInputProps } from 'sanity'

type SelectionItem = {
  _id: string
  albumTitle?: string
  albumSlug?: string
  clientEmail?: string
  status?: string
  photoCount?: number
  selectedFiles?: string[]
  lastActivityAt?: string
  submittedAt?: string
}

type AlbumImageMeta = {
  filename?: string
  url?: string
}

export function ClientSelectionsViewer(_props: StringInputProps) {
  const client = useClient({ apiVersion: '2024-01-01' })
  const slug = useFormValue(['slug']) as { current?: string } | undefined
  const [selections, setSelections] = useState<SelectionItem[]>([])
  const [albumImages, setAlbumImages] = useState<AlbumImageMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [expandedThumbs, setExpandedThumbs] = useState<Record<string, boolean>>({})

  const currentSlug = slug?.current

  const fetchData = useCallback(async () => {
    if (!currentSlug) return
    setLoading(true)
    try {
      const [selRes, imgRes] = await Promise.all([
        client.fetch<SelectionItem[]>(
          `*[_type == "clientSelection" && albumSlug == $slug] | order(lastActivityAt desc) {
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
          { slug: currentSlug }
        ),
        client.fetch<AlbumImageMeta[]>(
          `*[_type == "clientAlbum" && slug.current == $slug][0].images[]{
            "filename": asset->originalFilename,
            "url": asset->url + "?w=160&h=160&fit=crop&auto=format&q=70"
          }`,
          { slug: currentSlug }
        ),
      ])

      setSelections(selRes || [])
      setAlbumImages(imgRes || [])
    } catch (err) {
      console.error('Erro ao buscar seleções no Studio:', err)
    } finally {
      setLoading(false)
    }
  }, [client, currentSlug])

  useEffect(() => {
    fetchData()
    // Atualização automática a cada 10 segundos para monitorar seleção em tempo real
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const copyLightroomList = async (id: string, files: string[] = []) => {
    const listString = files.join(', ')
    await navigator.clipboard.writeText(listString)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 3000)
  }

  const toggleThumbs = (id: string) => {
    setExpandedThumbs((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return ''
    try {
      const d = new Date(isoString)
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return isoString
    }
  }

  if (!currentSlug) {
    return (
      <div style={{ padding: 14, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, color: '#64748b' }}>
        Gere o link (slug) do ensaio primeiro para acompanhar as seleções de fotos.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Acompanhamento em Tempo Real ({selections.length})
          </span>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Atualização automática a cada 10s. Você pode ver as fotos favoritadas a qualquer momento.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchData}
          disabled={loading}
          style={{
            padding: '6px 12px',
            background: '#f1f5f9',
            border: '1px solid #cbd5e1',
            borderRadius: 4,
            cursor: loading ? 'wait' : 'pointer',
            fontSize: 12,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {loading ? '🔄 Atualizando...' : '🔄 Atualizar Agora'}
        </button>
      </div>

      {selections.length === 0 ? (
        <div style={{ padding: 18, background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: 8, textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#334155' }}>
            Nenhuma foto favoritada registrada até o momento
          </p>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>
            Assim que o cliente abrir a galeria e tocar no coração das fotos, elas aparecerão aqui automaticamente.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {selections.map((item) => {
            const isSubmitted = item.status === 'submitted'
            const files = item.selectedFiles || []
            const isCopied = copiedId === item._id
            const showThumbs = expandedThumbs[item._id] ?? true

            return (
              <div
                key={item._id}
                style={{
                  border: isSubmitted ? '2px solid #22c55e' : '2px solid #f59e0b',
                  borderRadius: 8,
                  padding: 16,
                  background: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* Cabeçalho da Seleção */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#0f172a',
                          background: '#f1f5f9',
                          padding: '3px 8px',
                          borderRadius: 4,
                        }}
                      >
                        ✉️ {item.clientEmail || 'Cliente (Sem e-mail informado)'}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 999,
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          background: isSubmitted ? '#dcfce7' : '#fef3c7',
                          color: isSubmitted ? '#15803d' : '#b45309',
                        }}
                      >
                        {isSubmitted ? '🟢 Enviado para Edição' : '🟡 Selecionando em Andamento'}
                      </span>
                    </div>

                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#64748b' }}>
                      {isSubmitted && item.submittedAt
                        ? `Enviado em: ${formatDate(item.submittedAt)}`
                        : `Última alteração: ${formatDate(item.lastActivityAt)}`}
                    </p>
                  </div>

                  {/* Botões de Ação */}
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => copyLightroomList(item._id, files)}
                      disabled={files.length === 0}
                      style={{
                        padding: '8px 14px',
                        background: isCopied ? '#22c55e' : '#0f172a',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: files.length === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      {isCopied ? '✓ Lista Copiada!' : '📋 Copiar para o Lightroom'}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleThumbs(item._id)}
                      style={{
                        padding: '8px 12px',
                        background: '#f8fafc',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {showThumbs ? 'Ocultar Fotos' : `Ver Fotos (${files.length})`}
                    </button>
                  </div>
                </div>

                {/* Resumo da Contagem */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                  <span>❤️ {files.length} fotos favoritadas</span>
                  {files.length > 0 && (
                    <span style={{ color: '#64748b', fontSize: 12, fontWeight: 400 }}>
                      (Prontas para filtrar no Lightroom)
                    </span>
                  )}
                </div>

                {/* Caixa com a lista em texto puro */}
                {files.length > 0 && (
                  <div
                    style={{
                      background: '#f8fafc',
                      padding: 10,
                      borderRadius: 4,
                      border: '1px solid #e2e8f0',
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: '#334155',
                      maxHeight: 70,
                      overflowY: 'auto',
                      wordBreak: 'break-all',
                    }}
                  >
                    {files.join(', ')}
                  </div>
                )}

                {/* Grid Visual de Miniaturas */}
                {showThumbs && files.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))',
                        gap: 8,
                        maxHeight: 260,
                        overflowY: 'auto',
                        padding: 4,
                        border: '1px solid #f1f5f9',
                        borderRadius: 6,
                        background: '#fafafa',
                      }}
                    >
                      {files.map((filename) => {
                        const matched = albumImages.find((img) => img.filename === filename)
                        return (
                          <div
                            key={filename}
                            style={{
                              position: 'relative',
                              aspectRatio: '1/1',
                              borderRadius: 4,
                              overflow: 'hidden',
                              border: '1px solid #e2e8f0',
                              background: '#e2e8f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                            title={filename}
                          >
                            {matched?.url ? (
                              <img
                                src={matched.url}
                                alt={filename}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <span style={{ fontSize: 9, color: '#64748b', textAlign: 'center', padding: 2, wordBreak: 'break-all' }}>
                                {filename}
                              </span>
                            )}
                            <div
                              style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                background: 'rgba(0,0,0,0.65)',
                                color: '#ffffff',
                                fontSize: 8,
                                padding: '1px 2px',
                                textAlign: 'center',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {filename}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
