local LrView = import 'LrView'
local LrBinding = import 'LrBinding'
local LrDialogs = import 'LrDialogs'
local LrHttp = import 'LrHttp'
local LrTasks = import 'LrTasks'
local LrFileUtils = import 'LrFileUtils'
local LrPathUtils = import 'LrPathUtils'
local LrDate = import 'LrDate'
local LrProgressScope = import 'LrProgressScope'

local bind = LrView.bind

local ExportServiceProvider = {}

-- Codifica string em URL-encode para envio seguro em headers HTTP (suporta acentos UTF-8)
local function urlEncode(str)
  if not str then return '' end
  str = string.gsub(str, '\n', '\r\n')
  str = string.gsub(str, '([^%w %-%_%.%~])', function(c)
    return string.format('%%%02X', string.byte(c))
  end)
  str = string.gsub(str, ' ', '%%20')
  return str
end

local function trim(s)
  if not s then return '' end
  return (string.gsub(s, '^%s*(.-)%s*$', '%1'))
end

-- Campos salvos nos presets de exportação do Lightroom
ExportServiceProvider.exportPresetFields = {
  { key = 'siteUrl', default = 'https://www.arturdiasfotografia.com.br' },
  { key = 'apiKey', default = 'artur-lr-2026' },
  { key = 'destinationMode', default = 'new_gallery' }, -- 'new_gallery' ou 'existing_gallery'
  { key = 'categoryId', default = '' },
  { key = 'existingGalleryId', default = '' },
  { key = 'newGalleryTitle', default = '' },
  { key = 'workDate', default = '' },
  { key = 'firstAsCover', default = true },
  { key = 'favoriteCount', default = 5 },
  { key = 'categoryItems', default = { { title = 'Clique em "Recarregar Categorias"', value = '' } } },
  { key = 'galleryItems', default = { { title = 'Nenhuma galeria carregada', value = '' } } },
  { key = 'connectionStatus', default = 'Conectando ao portfólio...' },
}

-- Mantém as seções padrão de formato de arquivo (JPEG, qualidade, sRGB, redimensionamento, nitidez de saída)
ExportServiceProvider.hideSections = { 'exportLocation', 'postProcessing' }
ExportServiceProvider.allowFileFormats = { 'JPEG' }
ExportServiceProvider.allowColorSpaces = { 'sRGB' }

-- Busca categorias e galerias recentes diretamente da API do site
local function fetchPortfolioMetadata(propertyTable)
  LrTasks.startAsyncTask(function()
    local baseUrl = trim(propertyTable.siteUrl or 'https://www.arturdiasfotografia.com.br')
    baseUrl = string.gsub(baseUrl, '/+$', '')
    local endpoint = baseUrl .. '/api/lightroom?format=text'

    propertyTable.connectionStatus = 'Carregando categorias de ' .. baseUrl .. '...'

    local body, headers = LrHttp.get(endpoint, {
      { field = 'x-lr-api-key', value = trim(propertyTable.apiKey or '') },
      { field = 'x-lr-format', value = 'text' },
    })

    if not body or string.len(body) == 0 then
      propertyTable.connectionStatus = 'Não foi possível conectar a ' .. baseUrl .. '. Verifique a URL.'
      return
    end

    local cats = {}
    local gals = {}

    for line in string.gmatch(body, '[^\r\n]+') do
      local kind, id, title, extra = string.match(line, '^([^|]+)|([^|]+)|([^|]*)|?(.*)$')
      if kind == 'CAT' and id and title then
        table.insert(cats, { title = title, value = id })
      elseif kind == 'GAL' and id and title then
        table.insert(gals, { title = title, value = id })
      end
    end

    if #cats > 0 then
      propertyTable.categoryItems = cats
      local hasCurrentCat = false
      for _, c in ipairs(cats) do
        if c.value == propertyTable.categoryId then
          hasCurrentCat = true
          break
        end
      end
      if not hasCurrentCat then
        propertyTable.categoryId = cats[1].value
      end
    else
      propertyTable.categoryItems = { { title = 'Nenhuma categoria encontrada no site', value = '' } }
    end

    if #gals > 0 then
      propertyTable.galleryItems = gals
      local hasCurrentGal = false
      for _, g in ipairs(gals) do
        if g.value == propertyTable.existingGalleryId then
          hasCurrentGal = true
          break
        end
      end
      if not hasCurrentGal then
        propertyTable.existingGalleryId = gals[1].value
      end
    else
      propertyTable.galleryItems = { { title = 'Nenhuma galeria existente encontrada', value = '' } }
    end

    propertyTable.connectionStatus = string.format(
      '✓ Conectado ao portfólio (%d categorias, %d galerias recentes)',
      #cats,
      #gals
    )
  end)
end

function ExportServiceProvider.startDialog(propertyTable)
  if not propertyTable.workDate or trim(propertyTable.workDate) == '' then
    propertyTable.workDate = LrDate.timeToUserFormat(LrDate.currentTime(), '%Y-%m-%d')
  end
  fetchPortfolioMetadata(propertyTable)
end

function ExportServiceProvider.sectionsForTopOfDialog(f, propertyTable)
  return {
    {
      title = 'Artur Dias Portfólio — Destino da Nova Galeria (Trabalhos Recentes)',
      synopsis = bind 'newGalleryTitle',

      f:column {
        spacing = f:control_spacing(),
        fill_horizontal = 1,

        f:row {
          spacing = f:label_spacing(),
          f:static_text {
            title = 'Status:',
            width = 140,
            alignment = 'right',
          },
          f:static_text {
            title = bind 'connectionStatus',
            fill_horizontal = 1,
          },
          f:push_button {
            title = '↻ Recarregar Categorias',
            action = function()
              fetchPortfolioMetadata(propertyTable)
            end,
          },
        },

        f:separator { fill_horizontal = 1 },

        f:row {
          spacing = f:label_spacing(),
          f:static_text {
            title = 'Ação no Portfólio:',
            width = 140,
            alignment = 'right',
          },
          f:popup_menu {
            value = bind 'destinationMode',
            items = {
              { title = 'Criar Novo Álbum (Trabalhos Recentes) em uma Categoria', value = 'new_gallery' },
              { title = 'Adicionar Fotos a uma Galeria já Existente', value = 'existing_gallery' },
            },
          },
        },

        f:row {
          spacing = f:label_spacing(),
          f:static_text {
            title = 'Categoria do Portfólio:',
            width = 140,
            alignment = 'right',
          },
          f:popup_menu {
            value = bind 'categoryId',
            items = bind 'categoryItems',
            enabled = LrBinding.keyEquals('destinationMode', 'new_gallery'),
          },
        },

        f:row {
          spacing = f:label_spacing(),
          f:static_text {
            title = 'Nome da Nova Galeria:',
            width = 140,
            alignment = 'right',
          },
          f:edit_field {
            value = bind 'newGalleryTitle',
            width_in_chars = 36,
            immediate = true,
            enabled = LrBinding.keyEquals('destinationMode', 'new_gallery'),
          },
        },

        f:row {
          spacing = f:label_spacing(),
          f:static_text {
            title = 'Data do Trabalho:',
            width = 140,
            alignment = 'right',
          },
          f:edit_field {
            value = bind 'workDate',
            width_in_chars = 14,
            enabled = LrBinding.keyEquals('destinationMode', 'new_gallery'),
          },
          f:static_text {
            title = '(Formato YYYY-MM-DD — define a ordem em Últimos Trabalhos)',
          },
        },

        f:row {
          spacing = f:label_spacing(),
          f:static_text {
            title = 'Galeria Existente:',
            width = 140,
            alignment = 'right',
          },
          f:popup_menu {
            value = bind 'existingGalleryId',
            items = bind 'galleryItems',
            enabled = LrBinding.keyEquals('destinationMode', 'existing_gallery'),
          },
        },

        f:separator { fill_horizontal = 1 },

        f:row {
          spacing = f:label_spacing(),
          f:static_text {
            title = 'Capa e Destaques:',
            width = 140,
            alignment = 'right',
          },
          f:checkbox {
            title = 'Definir a 1ª foto exportada como Capa do Álbum',
            value = bind 'firstAsCover',
          },
        },

        f:row {
          spacing = f:label_spacing(),
          f:static_text {
            title = 'Fotos Rotativas (Home):',
            width = 140,
            alignment = 'right',
          },
          f:edit_field {
            value = bind 'favoriteCount',
            width_in_chars = 5,
            min = 0,
            max = 15,
            precision = 0,
          },
          f:static_text {
            title = 'primeiras fotos marcadas como Favoritas para girar no card da Home',
          },
        },

        f:separator { fill_horizontal = 1 },

        f:row {
          spacing = f:label_spacing(),
          f:static_text {
            title = 'URL do Site:',
            width = 140,
            alignment = 'right',
          },
          f:edit_field {
            value = bind 'siteUrl',
            width_in_chars = 32,
          },
        },

        f:row {
          spacing = f:label_spacing(),
          f:static_text {
            title = 'Chave de API / Senha:',
            width = 140,
            alignment = 'right',
          },
          f:password_field {
            value = bind 'apiKey',
            width_in_chars = 24,
          },
        },
      },
    },
  }
end

function ExportServiceProvider.processRenderedPhotos(functionContext, exportContext)
  local exportSession = exportContext.exportSession
  local exportParams = exportContext.propertyTable
  local nPhotos = exportSession:countRenditions()

  local baseUrl = trim(exportParams.siteUrl or 'https://www.arturdiasfotografia.com.br')
  baseUrl = string.gsub(baseUrl, '/+$', '')
  local endpoint = baseUrl .. '/api/lightroom'
  local apiKey = trim(exportParams.apiKey or 'artur-lr-2026')
  local mode = exportParams.destinationMode or 'new_gallery'

  local targetGalleryId = ''
  local targetGalleryName = ''

  local progressScope = exportContext:configureProgress {
    title = string.format('Enviando %d foto(s) para o Portfólio Artur Dias...', nPhotos),
  }

  -- 1. Se o modo for Criar Nova Galeria, cria o documento no Sanity antes de subir as fotos
  if mode == 'new_gallery' then
    local title = trim(exportParams.newGalleryTitle or '')
    local categoryId = trim(exportParams.categoryId or '')
    local workDate = trim(exportParams.workDate or '')

    if title == '' then
      LrDialogs.message(
        'Nome da Galeria Obrigatório',
        'Por favor, informe o nome da nova galeria antes de exportar para o portfólio.',
        'critical'
      )
      return
    end

    if categoryId == '' then
      LrDialogs.message(
        'Categoria Obrigatória',
        'Por favor, selecione uma Categoria do Portfólio (clique em "Recarregar Categorias" se a lista estiver vazia).',
        'critical'
      )
      return
    end

    local createHeaders = {
      { field = 'Content-Type', value = 'text/plain; charset=utf-8' },
      { field = 'x-lr-api-key', value = apiKey },
      { field = 'x-lr-format', value = 'text' },
      { field = 'x-lr-action', value = 'create-gallery' },
      { field = 'x-lr-title', value = urlEncode(title) },
      { field = 'x-lr-category-id', value = urlEncode(categoryId) },
      { field = 'x-lr-work-date', value = urlEncode(workDate) },
    }

    local respBody, _ = LrHttp.post(endpoint, 'create', createHeaders)
    if not respBody then
      LrDialogs.message(
        'Erro de Conexão',
        'Não foi possível conectar ao servidor do portfólio em ' .. endpoint,
        'critical'
      )
      return
    end

    local statusKind, payload = string.match(respBody, '^([^|]+)|(.*)$')
    if statusKind ~= 'OK' or not payload or trim(payload) == '' then
      LrDialogs.message(
        'Erro ao Criar Galeria',
        'O servidor retornou: ' .. tostring(payload or respBody),
        'critical'
      )
      return
    end

    targetGalleryId = trim(payload)
    targetGalleryName = title
  else
    targetGalleryId = trim(exportParams.existingGalleryId or '')
    targetGalleryName = 'Galeria Selecionada'
    if targetGalleryId == '' then
      LrDialogs.message(
        'Galeria Obrigatória',
        'Selecione uma galeria existente na lista.',
        'critical'
      )
      return
    end
  end

  local uploadedCount = 0
  local failedCount = 0
  local favLimit = tonumber(exportParams.favoriteCount) or 5
  local setFirstCover = exportParams.firstAsCover == true

  -- 2. Renderiza cada foto com as edições do Lightroom e faz upload direto para a galeria no Sanity
  for i, rendition in exportContext:renditions { stopIfCanceled = true } do
    progressScope:setPortionComplete((i - 1) / nPhotos)

    local success, pathOrMessage = rendition:waitForRender()
    if progressScope:isCanceled() then break end

    if success then
      local filename = LrPathUtils.leafName(pathOrMessage)
      local fileBytes = LrFileUtils.readFile(pathOrMessage)

      local isCover = (mode == 'new_gallery') and setFirstCover and (i == 1)
      local isFavorite = (i <= favLimit)

      local uploadHeaders = {
        { field = 'Content-Type', value = 'image/jpeg' },
        { field = 'x-lr-api-key', value = apiKey },
        { field = 'x-lr-format', value = 'text' },
        { field = 'x-lr-action', value = 'upload-photo' },
        { field = 'x-lr-gallery-id', value = urlEncode(targetGalleryId) },
        { field = 'x-lr-filename', value = urlEncode(filename) },
        { field = 'x-lr-is-cover', value = isCover and 'true' or 'false' },
        { field = 'x-lr-is-favorite', value = isFavorite and 'true' or 'false' },
      }

      local upBody, _ = LrHttp.post(endpoint, fileBytes, uploadHeaders)
      local upStatus, _ = string.match(upBody or '', '^([^|]+)|(.*)$')

      if upStatus == 'OK' then
        uploadedCount = uploadedCount + 1
      else
        failedCount = failedCount + 1
      end

      -- Remove o arquivo temporário renderizado após o upload
      LrFileUtils.delete(pathOrMessage)
    else
      failedCount = failedCount + 1
    end

    progressScope:setPortionComplete(i / nPhotos)
  end

  progressScope:done()

  if failedCount == 0 then
    LrDialogs.message(
      'Publicação no Portfólio Concluída!',
      string.format(
        '%d foto(s) enviadas com sucesso para "%s" (já visível na categoria escolhida e em Últimos Trabalhos).',
        uploadedCount,
        targetGalleryName
      ),
      'info'
    )
  else
    LrDialogs.message(
      'Publicação Concluída com Avisos',
      string.format(
        '%d foto(s) enviadas com sucesso, %d falha(s).',
        uploadedCount,
        failedCount
      ),
      'warning'
    )
  end
end

return ExportServiceProvider
