const API_STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE_URL || 'https://admin.umrahgo.net/storage/';

/**
 * Valida e formata URLs de imagens para garantir que elas sejam válidas
 * @param url URL da imagem para validar
 * @param fallback URL de fallback se a imagem for inválida ou nula
 * @returns URL válida para a imagem
 */
export function getValidImageUrl(
  url: string | null | undefined,
  fallback: string = '/images/placeholder.jpg'
): string {
  if (!url) return fallback;

  // Se já for uma URL completa com http ou https
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Se começa com barra, talvez seja um caminho absoluto relativo (ex: /images/local.jpg)
  if (url.startsWith('/') && !url.includes('storage/')) {
    return url;
  }

  // Corrigir caminhos do tipo "/storage/packages/..." ou "packages/..."
  const cleanedUrl = url.replace(/^\/?storage\//, ''); // remove "storage/" or "/storage/"

  return `${API_STORAGE_URL}${cleanedUrl}`;
}
