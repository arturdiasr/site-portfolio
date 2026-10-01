import React, { useState, useEffect } from 'react'
import { useClient } from 'sanity'
import { Box, Card, Stack, Text, Button, Select, Grid, Checkbox, Flex, Inline } from '@sanity/ui'

export function MovePhotosTool() {
  const client = useClient({ apiVersion: '2023-01-01' })
  const [categories, setCategories] = useState<any[]>([])
  const [galleries, setGalleries] = useState<any[]>([])
  
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedGallery, setSelectedGallery] = useState('')
  
  const [images, setImages] = useState<any[]>([])
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set())
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  // Carregar categorias e galerias no início
  useEffect(() => {
    client.fetch(`{
      "categories": *[_type == "category"]{_id, title},
      "galleries": *[_type == "gallery"]{_id, title, category}
    }`).then(res => {
      setCategories(res.categories)
      setGalleries(res.galleries)
    })
  }, [])

  // Carregar imagens da categoria selecionada
  useEffect(() => {
    if (!selectedCategory) {
      setImages([])
      setSelectedImages(new Set())
      return
    }
    
    setLoading(true)
    client.fetch(`*[_type == "category" && _id == $id][0] {
      images[] {
        _key,
        "url": asset->url
      }
    }`, { id: selectedCategory }).then(res => {
      setImages(res?.images || [])
      setSelectedImages(new Set())
      setLoading(false)
    })
  }, [selectedCategory])

  const toggleImage = (key: string) => {
    const next = new Set(selectedImages)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setSelectedImages(next)
  }

  const toggleAll = () => {
    if (selectedImages.size === images.length) {
      setSelectedImages(new Set())
    } else {
      setSelectedImages(new Set(images.map(img => img._key)))
    }
  }

  const handleMove = async () => {
    if (!selectedCategory || !selectedGallery || selectedImages.size === 0) return
    
    setLoading(true)
    setSuccess('')
    
    try {
      // 1. Obter os objetos inteiros das imagens selecionadas
      const fullCategory = await client.getDocument(selectedCategory)
      if (!fullCategory || !fullCategory.images) return
      
      const imagesToMove = (fullCategory.images as any[]).filter(img => selectedImages.has(img._key))
      const imagesToKeep = (fullCategory.images as any[]).filter(img => !selectedImages.has(img._key))
      
      // 2. Adicionar na Galeria
      await client.patch(selectedGallery)
        .setIfMissing({ images: [] })
        .append('images', imagesToMove)
        .commit()
        
      // 3. Remover da Categoria
      await client.patch(selectedCategory)
        .set({ images: imagesToKeep })
        .commit()
        
      setSuccess(`${selectedImages.size} fotos movidas com sucesso!`)
      
      // Atualizar a tela
      setImages(imagesToKeep)
      setSelectedImages(new Set())
    } catch (err) {
      console.error(err)
      alert("Ocorreu um erro ao mover as fotos.")
    } finally {
      setLoading(false)
    }
  }

  // Filtrar galerias da categoria selecionada
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
            <select style={{ width: '100%', padding: '8px' }} onChange={e => setSelectedGallery(e.target.value)} value={selectedGallery} disabled={!selectedCategory}>
              <option value="">Selecione uma galeria...</option>
              {filteredGalleries.map(g => <option key={g._id} value={g._id}>{g.title}</option>)}
            </select>
            {selectedCategory && filteredGalleries.length === 0 && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '8px' }}>Nenhuma galeria encontrada para esta categoria. Crie uma primeiro.</p>
            )}
          </div>
        </div>

        {images.length > 0 && (
          <div style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontWeight: '600', margin: 0 }}>3. Selecione as fotos ({selectedImages.size} de {images.length} selecionadas)</p>
              <button 
                style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                onClick={toggleAll}
              >
                {selectedImages.size === images.length ? "Desmarcar Todas" : "Selecionar Todas"}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', maxHeight: '500px', overflowY: 'auto', padding: '5px' }}>
              {images.map(img => (
                <div 
                  key={img._key} 
                  onClick={() => toggleImage(img._key)}
                  style={{ 
                    position: 'relative', 
                    cursor: 'pointer',
                    border: selectedImages.has(img._key) ? '3px solid #2276fc' : '1px solid #ddd',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    aspectRatio: '1/1'
                  }}
                >
                  <img src={img.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', top: '5px', left: '5px', backgroundColor: 'white', padding: '2px', borderRadius: '3px' }}>
                    <input type="checkbox" checked={selectedImages.has(img._key)} readOnly style={{ margin: 0 }} />
                  </div>
                </div>
              ))}
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
                {loading ? "Movendo..." : `Mover ${selectedImages.size} fotos para a Galeria`}
              </button>
            </div>
          </div>
        )}
        
        {selectedCategory && images.length === 0 && !loading && (
          <p style={{ color: '#666' }}>Nenhuma foto solta encontrada nesta categoria.</p>
        )}
        {loading && !images.length && <p style={{ color: '#666' }}>Carregando fotos...</p>}

      </div>
    </div>
  )
}
