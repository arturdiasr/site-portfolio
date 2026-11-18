# Plugin Adobe Lightroom Classic — Artur Dias Portfólio

Este plugin (`ArturDiasPortfolio.lrplugin`) permite selecionar fotos já editadas no seu catálogo do **Adobe Lightroom Classic** e exportá-las diretamente para uma **nova galeria (Últimos Trabalhos)** dentro de qualquer **Categoria** do seu portfólio no Sanity.

---

## 1. Como Instalar no Lightroom Classic

1. Abra o **Adobe Lightroom Classic**.
2. No menu superior, clique em **Arquivo** (`File`) > **Gerenciador de Plug-ins...** (`Plug-in Manager...`) ou use o atalho `Ctrl + Alt + Shift + ,`.
3. Na parte inferior esquerda da janela, clique no botão **Adicionar** (`Add`).
4. Navegue até a pasta deste projeto e selecione a pasta:
   `lightroom-plugin/ArturDiasPortfolio.lrplugin`
5. Clique em **Selecionar Pasta** e depois em **Concluído**.

---

## 2. Como Exportar Fotos Direto para um Novo Álbum do Portfólio

1. Selecione as fotos já editadas na Biblioteca ou Revelação do Lightroom.
2. Clique em **Arquivo > Exportar...** (`Ctrl + Shift + E`).
3. No menu superior **"Exportar para:"** (`Export To:`), escolha:
   **`Artur Dias Portfólio (Trabalhos Recentes)`**
4. Na seção **Artur Dias Portfólio — Destino da Nova Galeria**:
   - **Ação no Portfólio:** Escolha `"Criar Novo Álbum (Trabalhos Recentes) em uma Categoria"` (ou `"Adicionar Fotos a uma Galeria já Existente"`).
   - **Categoria do Portfólio:** Escolha a categoria desejada (ex: *Shows*, *Arquitetura*, *Ensaios*, *Eventos*). Caso tenha acabado de criar uma categoria nova no site, clique em **`↻ Recarregar Categorias`**.
   - **Nome da Nova Galeria:** Digite o título do trabalho (ex: `Show Natiruts em Brasília`).
   - **Data do Trabalho:** Vem preenchida automaticamente com a data de hoje (`YYYY-MM-DD`) para que o álbum apareça imediatamente no topo do carrossel **"Últimos Trabalhos"** na Home.
   - **Capa e Destaques:** A 1ª foto exportada é definida automaticamente como **Capa do Álbum** e as primeiras 5 fotos são marcadas como **Favoritas** para girar automaticamente no card da página inicial.
   - **Chave de API / Senha:** Por padrão já vem configurada como `artur-lr-2026` (você também pode usar sua senha mestre de admin `adminartur` ou alterá-la no Sanity em *Configurações & Senha Admin*).
5. Clique em **Exportar**! O Lightroom irá renderizar as fotos com todas as suas edições e enviá-las diretamente para o site em produção.
