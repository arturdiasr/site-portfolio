import React, { useState, useEffect } from 'react'
import { useClient } from 'sanity'

export function MovePhotosTool() {
  const client = useClient({ apiVersion: '2023-01-01' })
  const [categories, setCategories] = useState<any[]>([])
  const [galleries, setGalleries] = useState<any[]>([])
  
  const [selectedSource, setSelectedSource] = useState('')
  const [selectedSourceType, setSelectedSourceType] = useState<'category' | 'gallery' | null>(null)
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

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const gridRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (draggedIdx !== null && gridRef.current) {
        gridRef.current.scrollTop += e.deltaY;
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [draggedIdx]);

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
    if (!selectedSource) {
      setImages([])
      setSelectedImages(new Set())
      setSelectedCoverKey(null)
      setSelectedSourceType(null)
      return
    }
    
    const isCat = categories.some(c => c._id === selectedSource)
    setSelectedSourceType(isCat ? 'category' : 'gallery')
    
    setLoading(true)
    client.fetch(`*[_id == $id][0] {
      images[] {
        _key,
        "url": asset->url + "?w=200&h=200&fit=crop&auto=format&q=60",
        "originalFilename": asset->originalFilename
      }
    }`, { id: selectedSource }).then(res => {
      setImages(res?.images || [])
      setSelectedImages(new Set())
      setLastSelectedIdx(null)
      setSelectedCoverKey(null)
      setLoading(false)
    })
  }, [selectedSource, categories])

  const handleCreateGallery = async () => {
    if (!newGalleryTitle || !selectedSource) return
    setLoading(true)
    try {
      let targetCatRef = selectedSource;
      if (selectedSourceType === 'gallery') {
        const sourceGal = galleries.find(g => g._id === selectedSource);
        if (sourceGal?.category?._ref) {
          targetCatRef = sourceGal.category._ref;
        }
      }

      const doc = await client.create({
        _type: 'gallery',
        title: newGalleryTitle,
        workDate: newGalleryDate || undefined,
        category: { _type: 'reference', _ref: targetCatRef }
      })
      setGalleries([...galleries, { _id: doc._id, title: doc.title, category: { _ref: targetCatRef } }])
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

  const handleSortImages = async () => {
    if (!selectedSource || images.length === 0) return;
    setLoading(true);
    setSuccess('');
    
    try {
      const fullDoc = await client.getDocument(selectedSource);
      if (!fullDoc || !fullDoc.images) return;
      
      const filenameMap = new Map();
      images.forEach(img => filenameMap.set(img._key, img.originalFilename || ''));
      
      let sortedFullImages = [...(fullDoc.images as any[])];
      let sortedLocalImages = [...images];

      if (selectedImages.size > 0) {
        // Sort only selected images in their existing positions
        const selectedKeys = new Set(selectedImages);
        
        // Local state sorting
        const localIndices: number[] = [];
        const localSelected: any[] = [];
        images.forEach((img, idx) => {
          if (selectedKeys.has(img._key)) {
            localIndices.push(idx);
            localSelected.push(img);
          }
        });
        
        localSelected.sort((a, b) => {
          const nameA = a.originalFilename || '';
          const nameB = b.originalFilename || '';
          return nameA.localeCompare(nameB);
        });
        
        localIndices.forEach((idx, i) => {
          sortedLocalImages[idx] = localSelected[i];
        });

        // Full doc sorting
        const fullIndices: number[] = [];
        const fullSelected: any[] = [];
        sortedFullImages.forEach((img, idx) => {
          if (selectedKeys.has(img._key)) {
            fullIndices.push(idx);
            fullSelected.push(img);
          }
        });
        
        fullSelected.sort((a, b) => {
          const nameA = filenameMap.get(a._key) || '';
          const nameB = filenameMap.get(b._key) || '';
          return nameA.localeCompare(nameB);
        });
        
        fullIndices.forEach((idx, i) => {
          sortedFullImages[idx] = fullSelected[i];
        });

      } else {
        // Sort everything
        sortedFullImages.sort((a, b) => {
          const nameA = filenameMap.get(a._key) || '';
          const nameB = filenameMap.get(b._key) || '';
          return nameA.localeCompare(nameB);
        });
        
        sortedLocalImages.sort((a, b) => {
          const nameA = a.originalFilename || '';
          const nameB = b.originalFilename || '';
          return nameA.localeCompare(nameB);
        });
      }
      
      await client.patch(selectedSource)
        .set({ images: sortedFullImages })
        .commit();
      
      setImages(sortedLocalImages);
      setSuccess(selectedImages.size > 0 ? `As ${selectedImages.size} fotos selecionadas foram ordenadas de A-Z!` : "Todas as fotos ordenadas de A-Z com sucesso!");
    } catch (e) {
      alert("Erro ao ordenar fotos");
    } finally {
      setLoading(false);
    }
  }

  const onDragStart = (e: React.DragEvent, idx: number) => {
    setDraggedIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
  }

  const onDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIdx !== idx) setDragOverIdx(idx);
  }

  const onDrop = async (e: React.DragEvent, dropIdx: number) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (draggedIdx === null || draggedIdx === dropIdx) return;
    
    const draggedKey = images[draggedIdx]._key;
    const isDraggingSelected = selectedImages.has(draggedKey);
    const keysToMove = isDraggingSelected ? new Set(selectedImages) : new Set([draggedKey]);
    
    const movedItems = images.filter(img => keysToMove.has(img._key));
    const remainingItems = images.filter(img => !keysToMove.has(img._key));
    
    const dropKey = images[dropIdx]._key;
    let insertIdx = remainingItems.findIndex(img => img._key === dropKey);
    if (insertIdx === -1) insertIdx = remainingItems.length;
    
    const newImages = [...remainingItems];
    newImages.splice(insertIdx, 0, ...movedItems);
    
    setImages(newImages);
    setLoading(true);
    
    try {
      const fullDoc = await client.getDocument(selectedSource);
      if (!fullDoc || !fullDoc.images) return;
      
      const fullMoved = (fullDoc.images as any[]).filter(img => keysToMove.has(img._key));
      const fullRemaining = (fullDoc.images as any[]).filter(img => !keysToMove.has(img._key));
      
      let fullInsertIdx = fullRemaining.findIndex(img => img._key === dropKey);
      if (fullInsertIdx === -1) fullInsertIdx = fullRemaining.length;
      
      fullRemaining.splice(fullInsertIdx, 0, ...fullMoved);
      
      await client.patch(selectedSource)
        .set({ images: fullRemaining })
        .commit();
        
      setSuccess(`${keysToMove.size} foto(s) reordenada(s) livremente com sucesso!`);
    } catch (err) {
      alert("Erro ao salvar ordem manual");
    } finally {
      setLoading(false);
      setDraggedIdx(null);
    }
  }

  const handleMove = async () => {
    if (!selectedSource || !selectedGallery || selectedImages.size === 0) return
    setLoading(true)
    setSuccess('')
    try {
      const fullDoc = await client.getDocument(selectedSource)
      if (!fullDoc || !fullDoc.images) return
      
      const imagesToMove = (fullDoc.images as any[]).filter(img => selectedImages.has(img._key)).map(img => {
        if (img._key === selectedCoverKey) {
          return { ...img, isCover: true }
        }
        return { ...img, isCover: false } // ensure others are false just in case
      })
      const imagesToKeep = (fullDoc.images as any[]).filter(img => !selectedImages.has(img._key))
      
      await client.patch(selectedGallery)
        .setIfMissing({ images: [] })
        .append('images', imagesToMove)
        .commit()
        
      await client.patch(selectedSource)
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

  const filteredGalleries = selectedSourceType === 'category' 
    ? galleries.filter(g => g.category?._ref === selectedSource)
    : galleries.filter(g => {
        const sourceGal = galleries.find(sg => sg._id === selectedSource);
        return g.category?._ref === sourceGal?.category?._ref && g._id !== selectedSource;
      });

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Organizador de Fotos Avançado</h2>
          <p style={{ color: '#666', marginTop: '8px' }}>Ordene as fotos da sua Categoria ou Sub-galeria, e mova-as para onde precisar.</p>
        </div>

        {success && (
          <div style={{ padding: '1rem', backgroundColor: '#e6f4ea', color: '#137333', borderRadius: '4px', border: '1px solid #ceead6' }}>
            {success}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <p style={{ fontWeight: '600', marginBottom: '8px' }}>1. Selecione a Origem das Fotos</p>
            <select style={{ width: '100%', padding: '8px' }} onChange={e => setSelectedSource(e.target.value)} value={selectedSource}>
              <option value="">Selecione uma categoria ou galeria...</option>
              <optgroup label="Categorias">
                {categories.map(c => <option key={c._id} value={c._id}>📁 {c.title}</option>)}
              </optgroup>
              <optgroup label="Sub-galerias">
                {galleries.map(g => <option key={g._id} value={g._id}>🖼️ {g.title}</option>)}
              </optgroup>
            </select>
          </div>
          
          <div>
            <p style={{ fontWeight: '600', marginBottom: '8px' }}>2. Para qual Sub-galeria mover?</p>
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
                    type="date" 
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
                <select style={{ flex: 1, padding: '8px' }} onChange={e => setSelectedGallery(e.target.value)} value={selectedGallery} disabled={!selectedSource}>
                  <option value="">Selecione uma galeria destino...</option>
                  {filteredGalleries.map(g => <option key={g._id} value={g._id}>{g.title}</option>)}
                </select>
                <button onClick={() => setIsCreatingGallery(true)} disabled={!selectedSource} style={{ padding: '8px', cursor: 'pointer' }}>+ Nova</button>
              </div>
            )}
          </div>
        </div>

        {images.length > 0 && (
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <p style={{ fontWeight: '600', margin: 0 }}>3. Selecione as fotos ({selectedImages.size} de {images.length} selecionadas)</p>
                <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Dica: Segure SHIFT para selecionar várias de uma vez, ou **arraste as fotos** para reorganizar livremente!</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  style={{ padding: '6px 12px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  onClick={handleSortImages}
                  disabled={loading}
                >
                  Ordenar A-Z (Por Nome Original)
                </button>
                <button 
                  style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                  onClick={toggleAll}
                >
                  {selectedImages.size === images.length ? "Desmarcar Todas" : "Selecionar Todas"}
                </button>
              </div>
            </div>

            <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px', maxHeight: '500px', overflowY: 'auto', padding: '5px', userSelect: 'none' }}>
              {images.map((img, idx) => {
                const isSelected = selectedImages.has(img._key);
                const isCover = selectedCoverKey === img._key;
                const isDragOver = dragOverIdx === idx;
                return (
                  <div 
                    key={img._key} 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '5px',
                      borderLeft: isDragOver ? '4px solid #2276fc' : 'none',
                      paddingLeft: isDragOver ? '4px' : '0'
                    }}
                    draggable
                    onDragStart={(e) => onDragStart(e, idx)}
                    onDragOver={(e) => onDragOver(e, idx)}
                    onDrop={(e) => onDrop(e, idx)}
                    onDragLeave={() => setDragOverIdx(null)}
                  >
                    <div 
                      onClick={(e) => toggleImage(idx, e)}
                      style={{ 
                        position: 'relative', 
                        cursor: 'grab',
                        border: isSelected ? '3px solid #2276fc' : '1px solid #ddd',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        aspectRatio: '1/1'
                      }}
                    >
                      <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                      <div style={{ position: 'absolute', top: '5px', left: '5px', backgroundColor: 'white', padding: '2px', borderRadius: '3px' }}>
                        <input type="checkbox" checked={isSelected} readOnly style={{ margin: 0, pointerEvents: 'none' }} />
                      </div>
                      {isCover && (
                        <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', background: 'rgba(34, 118, 252, 0.9)', color: 'white', fontSize: '10px', textAlign: 'center', padding: '4px 0', fontWeight: 'bold' }}>
                          FOTO DE CAPA
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '10px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                      {img.originalFilename || 'Sem nome'}
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
        
        {selectedSource && images.length === 0 && !loading && (
          <p style={{ color: '#666' }}>Nenhuma foto encontrada nesta origem.</p>
        )}
        {loading && !images.length && <p style={{ color: '#666' }}>Carregando...</p>}

      </div>
    </div>
  )
}
