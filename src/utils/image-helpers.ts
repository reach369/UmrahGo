// API storage base URL - deve ser carregado do .env
const API_STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE_URL || 'https://umrahgo.reach369.com/storage/';

/**
 * Valida e formata URLs de imagens para garantir que elas sejam válidas
 * @param url URL da imagem para validar
 * @param fallback URL de fallback se a imagem for inválida ou nula
 * @returns URL válida para a imagem
 */
export function getValidImageUrl(url: string | null | undefined, fallback: string = '/images/placeholder.jpg'): string {
  if (!url) return fallback;
  
  // Se já for uma URL válida com http ou https
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Se for um caminho relativo com barra inicial
  if (url.startsWith('/')) {
    return url;
  }
  
  // Se for um caminho de armazenamento da API sem barra inicial
  if (url.includes('umrah_offices/') || url.includes('packages/') || url.includes('users/')) {
    return `${API_STORAGE_URL}${url}`;
  }
  
  // Adicionar uma barra para outros caminhos relativos
  return `/${url}`;
}

/**
 * Função para formatar URLs para imagens de perfil, logo, etc.
 * @param url URL da imagem para validar
 * @param type Tipo de imagem (avatar, logo, etc.)
 * @returns URL válida para a imagem
 */
export function formatProfileImage(url: string | null | undefined, type: 'avatar' | 'logo' = 'avatar'): string {
  const defaultImage = type === 'avatar' ? '/images/avatar-placeholder.jpg' : '/images/logo-placeholder.jpg';
  return getValidImageUrl(url, defaultImage);
}

/**
 * Função para formatar URLs para galeria de imagens
 * @param urls Array de URLs de imagens
 * @returns Array de URLs validadas
 */
export function formatGalleryImages(urls: string[] | null | undefined): string[] {
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return ['/images/gallery-placeholder.jpg'];
  }
  
  return urls.map(url => getValidImageUrl(url));
} 