/**
 * Converte IDs de imagem do Wix para URLs públicas navegáveis.
 * @param {string} wixImageUrl - O link bruto do Wix (ex: wix:image://v1/...)
 * @param {number} width - Largura desejada (opcional)
 * @param {number} height - Altura desejada (opcional)
 * @returns {string} URL formatada ou imagem de fallback
 */
export const getWixImageUrl = (wixImageUrl, width = 600, height = 600) => {
  if (!wixImageUrl) {
    // Retorna uma imagem padrão caso o produto esteja sem foto
    return 'https://via.placeholder.com/600x600?text=Sem+Imagem';
  }

  // Se a URL já for um link comum (http/https), retorna ela mesma
  if (wixImageUrl.startsWith('http')) {
    return wixImageUrl;
  }

  // O Wix armazena imagens assim: wix:image://v1/ID_DA_IMAGEM/nome-arquivo.jpg#originWidth=...
  // Precisamos extrair apenas o ID (a parte entre 'v1/' e o próximo '/')
  const regex = /v1\/(.+?)\//;
  const match = wixImageUrl.match(regex);

  if (match && match[1]) {
    const imageId = match[1];
    // Retornamos a URL otimizada para web
    return `https://static.wixstatic.com/media/${imageId}/v1/fill/w_${width},h_${height},al_c,q_80/image.jpg`;
  }

  return wixImageUrl;
};