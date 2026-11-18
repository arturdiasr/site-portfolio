import React, { useState, useEffect, useCallback } from 'react';
import { useClient } from 'sanity';

type TabType = 'clientAlbum' | 'delivery' | 'clientSelection' | 'gallery';

type ManagedDoc = {
  _id: string;
  _type: string;
  _createdAt: string;
  title?: string;
  slug?: string;
  albumSlug?: string;
  albumTitle?: string;
  clientEmail?: string;
  categoryTitle?: string;
  mediaCount?: number;
  password?: string;
};

export function QuickAlbumManagerTool() {
  const client = useClient({ apiVersion: '2024-01-01' });
  const [activeTab, setActiveTab] = useState<TabType>('clientAlbum');
  const [items, setItems] = useState<ManagedDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [instantDelete, setInstantDelete] = useState(true);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState<'oldest' | 'newest'>('oldest');
  const [statusMsg, setStatusMsg] = useState('');

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setSelectedIds(new Set());
    try {
      let query = '';
      if (activeTab === 'clientAlbum') {
        query = `*[_type == "clientAlbum" && !(_id in path("drafts.**"))] {
          _id,
          _type,
          _createdAt,
          title,
          "slug": slug.current,
          password,
          "mediaCount": count(coalesce(images, [])) + count(coalesce(videos, []))
        }`;
      } else if (activeTab === 'delivery') {
        query = `*[_type == "delivery" && !(_id in path("drafts.**"))] {
          _id,
          _type,
          _createdAt,
          title,
          "slug": slug.current
        }`;
      } else if (activeTab === 'clientSelection') {
        query = `*[_type == "clientSelection" && !(_id in path("drafts.**"))] {
          _id,
          _type,
          _createdAt,
          albumTitle,
          albumSlug,
          clientEmail,
          "mediaCount": photoCount
        }`;
      } else if (activeTab === 'gallery') {
        query = `*[_type == "gallery" && !(_id in path("drafts.**"))] {
          _id,
          _type,
          _createdAt,
          title,
          "categoryTitle": category->title,
          "mediaCount": count(coalesce(images, []))
        }`;
      }

      const res = await client.fetch<ManagedDoc[]>(query);
      setItems(res || []);
    } catch (err) {
      console.error('Erro ao carregar itens para gerenciamento:', err);
    } finally {
      setLoading(false);
    }
  }, [client, activeTab]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const deleteSingleDoc = async (doc: ManagedDoc) => {
    const cleanId = doc._id.replace(/^drafts\./, '');
    const draftId = `drafts.${cleanId}`;

    // Se for um álbum de cliente, apaga também seleções vinculadas a esse slug
    if (doc._type === 'clientAlbum' && doc.slug) {
      try {
        const linkedSelections = await client.fetch<string[]>(
          `*[_type == "clientSelection" && albumSlug == $slug]._id`,
          { slug: doc.slug }
        );
        for (const selId of linkedSelections || []) {
          await client.delete(selId).catch(() => {});
        }
      } catch {}
    }

    await client.delete(draftId).catch(() => {});
    await client.delete(cleanId);
  };

  const handleDeleteOne = async (doc: ManagedDoc) => {
    const displayTitle = doc.title || doc.albumTitle || doc._id;
    if (!instantDelete) {
      const ok = window.confirm(`Tem certeza que deseja excluir "${displayTitle}"?`);
      if (!ok) return;
    }

    setDeletingIds((prev) => new Set(prev).add(doc._id));
    try {
      await deleteSingleDoc(doc);
      setItems((prev) => prev.filter((i) => i._id !== doc._id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(doc._id);
        return next;
      });
      setStatusMsg(`✓ "${displayTitle}" excluído com sucesso.`);
      setTimeout(() => setStatusMsg(''), 3500);
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
      alert('Erro ao excluir documento. Verifique se ele possui referências ativas.');
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(doc._id);
        return next;
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    const ok = window.confirm(`Confirmar a exclusão imediata de ${count} item(ns) selecionado(s)?`);
    if (!ok) return;

    const toDelete = items.filter((i) => selectedIds.has(i._id));
    setLoading(true);
    try {
      for (const doc of toDelete) {
        await deleteSingleDoc(doc);
      }
      setItems((prev) => prev.filter((i) => !selectedIds.has(i._id)));
      setSelectedIds(new Set());
      setStatusMsg(`✓ ${count} item(ns) excluído(s) com sucesso.`);
      setTimeout(() => setStatusMsg(''), 4000);
    } catch (err) {
      console.error('Erro na exclusão em lote:', err);
      alert('Ocorreu um erro ao excluir alguns itens.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectOlderThanDays = (days: number) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    const matching = filteredAndSorted
      .filter((doc) => new Date(doc._createdAt).getTime() < cutoff)
      .map((doc) => doc._id);
    setSelectedIds(new Set(matching));
  };

  const filteredAndSorted = items
    .filter((doc) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      const label = (doc.title || doc.albumTitle || '').toLowerCase();
      const sub = (doc.slug || doc.albumSlug || doc.clientEmail || doc.categoryTitle || '').toLowerCase();
      return label.includes(q) || sub.includes(q);
    })
    .sort((a, b) => {
      const tA = new Date(a._createdAt).getTime();
      const tB = new Date(b._createdAt).getTime();
      return sortOrder === 'oldest' ? tA - tB : tB - tA;
    });

  const toggleSelectAllVisible = () => {
    if (selectedIds.size === filteredAndSorted.length && filteredAndSorted.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSorted.map((i) => i._id)));
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const diffDays = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
      const formatted = d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      return `${formatted} (${diffDays === 0 ? 'hoje' : `há ${diffDays}d`})`;
    } catch {
      return iso;
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1150, margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
      {/* Cabeçalho */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            🗑️ Exclusão Rápida & Gerenciamento de Álbuns
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            Exclua álbuns antigos diretamente na lista com 1 clique ou em lote, sem precisar entrar em cada documento.
          </p>
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: instantDelete ? '#fef2f2' : '#f8fafc',
            border: `1px solid ${instantDelete ? '#fecaca' : '#e2e8f0'}`,
            padding: '8px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            color: instantDelete ? '#991b1b' : '#334155',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={instantDelete}
            onChange={(e) => setInstantDelete(e.target.checked)}
          />
          ⚡ Exclusão em 1-Clique (sem pop-up de confirmação individual)
        </label>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
        {[
          { id: 'clientAlbum', label: '📸 Álbuns de Clientes (Seleção)' },
          { id: 'delivery', label: '📦 Entregas Finais' },
          { id: 'clientSelection', label: '❤️ Listas Enviadas por Clientes' },
          { id: 'gallery', label: '🖼️ Galerias do Portfólio' },
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as TabType)}
              style={{
                padding: '10px 16px',
                borderRadius: 6,
                border: active ? '1px solid #0f172a' : '1px solid #cbd5e1',
                background: active ? '#0f172a' : '#ffffff',
                color: active ? '#ffffff' : '#334155',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Barra de Filtros e Ações em Lote */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 10,
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc',
          padding: 14,
          borderRadius: 8,
          border: '1px solid #e2e8f0',
          marginBottom: 16,
        }}
      >
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <input
            type="text"
            placeholder="Filtrar por nome, cliente ou slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              minWidth: 240,
              background: '#fff',
            }}
          />

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'oldest' | 'newest')}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              fontSize: 13,
              background: '#fff',
              fontWeight: 600,
            }}
          >
            <option value="oldest">Mais antigos primeiro (ideal p/ limpeza)</option>
            <option value="newest">Mais recentes primeiro</option>
          </select>

          <button
            type="button"
            onClick={() => selectOlderThanDays(30)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Selecionar +30 dias
          </button>

          <button
            type="button"
            onClick={() => selectOlderThanDays(60)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Selecionar +60 dias
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {selectedIds.size > 0 && (
            <button
              type="button"
              onClick={handleBulkDelete}
              style={{
                padding: '9px 16px',
                borderRadius: 6,
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              🗑️ Excluir Selecionados ({selectedIds.size})
            </button>
          )}

          <button
            type="button"
            onClick={fetchItems}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ↻ Atualizar
          </button>
        </div>
      </div>

      {statusMsg && (
        <div
          style={{
            padding: '10px 14px',
            marginBottom: 14,
            borderRadius: 6,
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          {statusMsg}
        </div>
      )}

      {/* Lista de Itens */}
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
          Carregando documentos...
        </div>
      ) : filteredAndSorted.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: 8 }}>
          Nenhum item encontrado nesta categoria.
        </div>
      ) : (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', background: '#fff' }}>
          {/* Cabeçalho da Tabela */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              background: '#f1f5f9',
              borderBottom: '1px solid #e2e8f0',
              fontSize: 12,
              fontWeight: 700,
              color: '#475569',
              textTransform: 'uppercase',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedIds.size === filteredAndSorted.length && filteredAndSorted.length > 0}
                onChange={toggleSelectAllVisible}
              />
              <span>Selecionar Todos ({filteredAndSorted.length})</span>
            </label>
            <span>Ações Diretas</span>
          </div>

          {filteredAndSorted.map((doc) => {
            const isDeleting = deletingIds.has(doc._id);
            const isChecked = selectedIds.has(doc._id);
            const mainTitle = doc.title || doc.albumTitle || 'Sem título';

            return (
              <div
                key={doc._id}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: '1px solid #f1f5f9',
                  background: isChecked ? '#fef2f2' : '#ffffff',
                  opacity: isDeleting ? 0.45 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 260, flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSelect(doc._id)}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 14, color: '#0f172a' }}>{mainTitle}</strong>
                      {typeof doc.mediaCount === 'number' && (
                        <span
                          style={{
                            fontSize: 11,
                            background: '#f1f5f9',
                            color: '#475569',
                            padding: '2px 8px',
                            borderRadius: 99,
                            fontWeight: 600,
                          }}
                        >
                          {doc.mediaCount} fotos/vídeos
                        </span>
                      )}
                      {doc.categoryTitle && (
                        <span
                          style={{
                            fontSize: 11,
                            background: '#e0f2fe',
                            color: '#0369a1',
                            padding: '2px 8px',
                            borderRadius: 99,
                            fontWeight: 600,
                          }}
                        >
                          {doc.categoryTitle}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                      Criado em: {formatDate(doc._createdAt)}
                      {doc.slug ? ` • /${doc._type === 'delivery' ? 'entrega' : 'cliente'}/${doc.slug}` : ''}
                      {doc.password ? ` • Senha: ${doc.password}` : ''}
                      {doc.clientEmail ? ` • Cliente: ${doc.clientEmail}` : ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {doc._type === 'clientAlbum' && doc.slug && (
                    <a
                      href={`/cliente/${doc.slug}?ghost=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '7px 12px',
                        borderRadius: 5,
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        fontSize: 12,
                        fontWeight: 600,
                        textDecoration: 'none',
                      }}
                    >
                      👁️ Ver Sem Rastro
                    </a>
                  )}

                  <a
                    href={`/studio/structure/${doc._type};${doc._id}`}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 5,
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      color: '#334155',
                      fontSize: 12,
                      fontWeight: 600,
                      textDecoration: 'none',
                    }}
                  >
                    ✏️ Abrir
                  </a>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleDeleteOne(doc)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 5,
                      border: '1px solid #fecaca',
                      background: '#fef2f2',
                      color: '#dc2626',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: isDeleting ? 'wait' : 'pointer',
                    }}
                  >
                    {isDeleting ? 'Excluindo...' : '🗑️ Excluir'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
