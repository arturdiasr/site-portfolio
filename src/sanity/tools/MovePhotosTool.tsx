import React, { useState, useEffect } from 'react'
import { useClient } from 'sanity'

export function MovePhotosTool() {
  const client = useClient({ apiVersion: '2023-01-01' })
  const [categories, setCategories] = useState<any[]>([])
  const [galleries, setGalleries] = useState<any[]>([])
  
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedGallery, setSelectedGallery] = useState('')
  
  const [images, setImages] = useState<any[]>([])
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  const [lastSelectedIdx, setLastSelectedIdx] = useState<number | null>(null)
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [isCreatingGallery, setIsCreatingGallery] = useState(false)
  const [newGalleryTitle, setNewGalleryTitle] = useState('')
  const [newGalleryDate, setNewGalleryDate] = useState('')
  const [selectedCoverKey, setSelectedCoverKey] = useState<string | null>(null)

  useEffect(() => {
    client.fetch(`{
      "categories": *[_type == "category"]{_id, title},
      "galleries": *[_type == "gallery"]{_id, title, category}
    }`).then(res => {
      setCategories(res.categories)
      setGalleries(res.galleries)
    })
  }, [])

  useEffect(() => {
    if (!selectedCategory) {
      setImages([])
      setSelectedImages(new Set())
      setSelectedCoverKey(null)
      return
    }
    setLoading(true)
    client.fetch(`*[_type == "category" && _id == $id][0] {
      images[] {
        _key,
        "url": asset->url + "?w=200&h=200&fit=crop&auto=format&q=60"
      }
    }`, { id: selectedCategory }).then(res => {
      setImages(res?.images || [])
      setSelectedImages(new Set())
      setLastSelectedIdx(null)
      setSelectedCoverKey(null)
      setLoading(false)
    })
  }, [selectedCategory])

  const handleCreateGallery = async () => {
    if (!newGalleryTitle || !selectedCategory) return
    setLoading(true)
    try {
      const doc = await client.create({
        _type: 'gallery',
        title: newGalleryTitle,
        workDate: newGalleryDate || undefined,
        category: { _type: 'reference', _ref: selectedCategory }
      })
      setGalleries([...galleries, { _id: doc._id, title: doc.title, category: { _ref: selectedCategory } }])
      setSelectedGallery(doc._id)
      setIsCreatingGallery(false)
      setNewGalleryTitle('')
      setNewGalleryDate('')
      setSuccess(`Sub-galeria "${doc.title}" criada com sucesso!`)
    } catch (e) {
      alert("Erro ao criar sub-galeria")
    } finally {
      setLoading(false)
    }
  }

  const toggleImage = (idx: number, e: React.MouseEvent) => {
    const key = images[idx]._key
    const next = new Set(selectedImages)
    
    if (e.shiftKey && lastSelectedIdx !== null) {
      const start = Math.min(lastSelectedIdx, idx)
      const end = Math.max(lastSelectedIdx, idx)
      const isSelecting = !next.has(key)
      
      for (let i = start; i <= end; i++) {
        const k = images[i]._key;
        if (isSelecting) {
          next.add(k)
        } else {
          next.delete(k)
          if (selectedCoverKey === k) setSelectedCoverKey(null)
        }
      }
    } else {
      if (next.has(key)) {
        next.delete(key)
        if (selectedCoverKey === key) setSelectedCoverKey(null)
      } else {
        next.add(key)
      }
    }
    
    setSelectedImages(next)
    setLastSelectedIdx(idx)
  }

  const toggleAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set())
      setSelectedCoverKey(null)
    } else {
      setSelectedImages(new Set(images.map(img => img._key)))
    }
  }

  const handleMove = async () => {
    if (!selectedCategory || !selectedGallery || selectedImages.size === 0) return
    setLoading(true)
    setSuccess('')
    try {
      const fullCategory = await client.getDocument(selectedCategory)
      if (!fullCategory || !fullCategory.images) return
      
      const imagesToMove = (fullCategory.images as any[]).filter(img => selectedImages.has(img._key)).map(img => {
        if (img._key === selectedCoverKey) {
          return { ...img, isCover: true }
        }
        return { ...img, isCover: false } // ensure others are false just in case
      })
      const imagesToKeep = (fullCategory.images as any[]).filter(img => !selectedImages.has(img._key))
      
      await client.patch(selectedGallery)
        .setIfMissing({ images: [] })
        .append('images', imagesToMove)
        .commit()
        
      await client.patch(selectedCategory)
        .set({ images: imagesToKeep })
        .commit()
        
      setSuccess(`${selectedImages.size} fotos movidas com sucesso!`)
      setImages(imagesToKeep)
      setSelectedImages(new Set())
      setSelectedCoverKey(null)
    } catch (err) {
      alert("Ocorreu um erro ao mover as fotos.")
    } finally {
      setLoading(false)
    }
  }

  const filteredGalleries = galleries.filter(g => g.category?._ref === selectedCategory)

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Organizador de Fotos (Mover em Lote)</h2>
          <p style={{ color: '#666', marginTop: '8px' }}>Mova várias fotos de uma Categoria diretamente para uma Sub-galeria.</p>
        </div>

        {success && (
          <div style={{ padding: '1rem', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '4px', border: '1px solid #ceead6' }}>
            {success}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ fontWeight: '600', marginBottom: '8px' }}>1. De qual Categoria?</p>
            <select style={{ width: '100%', padding: '8px' }} onChange={e => setSelectedCategory(e.target.value)} value={selectedCategory}>
              <option value="">Selecione uma categoria...</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          
          <div>
            <p style={{ fontWeight: '600', marginBottom: '8px' }}>2. Para qual Sub-galeria?</p>
            {isCreatingGallery ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Nome da nova galeria" 
                  value={newGalleryTitle} 
                  onChange={e => setNewGalleryTitle(e.target.value)} 
                  style={{ width: '100%', padding: '8px' }}
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder="Data (ex: Agosto 2026)" 
                    value={newGalleryDate} 
                    onChange={e => setNewGalleryDate(e.target.value)} 
                    style={{ flex: 1, padding: '8px' }}
                  />
                  <button onClick={handleCreateGallery} disabled={!newGalleryTitle || loading} style={{ padding: '8px', background: '#2276fc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Criar</button>
                  <button onClick={() => setIsCreatingGallery(false)} style={{ padding: '8px', cursor: 'pointer' }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <select style={{ flex: 1, padding: '8px' }} onChange={e => setSelectedGallery(e.target.value)} value={selectedGallery} disabled={!selectedCategory}>
                  <option value="">Selecione uma galeria...</option>
                  {filteredGalleries.map(g => <option key={g._id} value={g._id}>{g.title}</option>)}
                </select>
                <button onClick={() => setIsCreatingGallery(true)} disabled={!selectedCategory} style={{ padding: '8px', cursor: 'pointer' }}>+ Nova</button>
              </div>
            )}
          </div>
        </div>

        {images.length > 0 && (
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontWeight: '600', margin: 0 }}>3. Selecione as fotos ({selectedImages.size} de {images.length} selecionadas)</p>
              <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Dica: Segure SHIFT para selecionar várias de uma vez.</p>
              <button 
                style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                onClick={toggleAll}
              >
                {selectedImages.size === images.length ? "Desmarcar Todas" : "Selecionar Todas"}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px', maxHeight: '500px', overflowY: 'auto', padding: '5px', userSelect: 'none' }}>
              {images.map((img, idx) => {
                const isSelected = selectedImages.has(img._key);
                const isCover = selectedCoverKey === img._key;
                return (
                  <div key={img._key} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div 
                      onClick={(e) => toggleImage(idx, e)}
                      style={{ 
                        position: 'relative', 
                        cursor: 'pointer',
                        border: isSelected ? '3px solid #2276fc' : '1px solid #ddd',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        aspectRatio: '1/1'
                      }}
                    >
                      <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '5px', left: '5px', backgroundColor: 'white', padding: '2px', borderRadius: '3px' }}>
                        <input type="checkbox" checked={isSelected} readOnly style={{ margin: 0, pointerEvents: 'none' }} />
                      </div>
                      {isCover && (
                        <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', background: 'rgba(34, 118, 252, 0.9)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '4px 0', fontWeight: 'bold' }}>
                          FOTO DE CAPA
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <button 
                        onClick={() => setSelectedCoverKey(isCover ? null : img._key)}
                        style={{
                          fontSize: '11px',
                          padding: '4px',
                          borderRadius: '4px',
                          border: isCover ? '1px solid #2276fc' : '1px solid #ccc',
                          background: isCover ? '#e8f0fe' : 'transparent',
                          color: isCover ? '#2276fc' : '#666',
                          cursor: 'pointer',
                          fontWeight: isCover ? 'bold' : 'normal'
                        }}
                      >
                        {isCover ? "★ Capa Definida" : "Definir Capa"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '20px' }}>
              <button 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  backgroundColor: (selectedImages.size === 0 || !selectedGallery || loading) ? '#ccc' : '#2276fc', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: (selectedImages.size === 0 || !selectedGallery || loading) ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold'
                }}
                disabled={selectedImages.size === 0 || !selectedGallery || loading}
                onClick={handleMove}
              >
                {loading ? "Processando..." : `Mover ${selectedImages.size} fotos para a Galeria`}
              </button>
            </div>
          </div>
        )}
        
        {selectedCategory && images.length === 0 && !loading && (
          <p style={{ color: '#666' }}>Nenhuma foto solta encontrada nesta categoria.</p>
        )}
        {loading && !images.length && <p style={{ color: '#666' }}>Carregando...</p>}

      </div>
    </div>
  )
}
