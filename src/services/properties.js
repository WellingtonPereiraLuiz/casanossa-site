import { supabase } from './supabase';

export async function excluirImovelComFotos(propertyId) {
  try {
    // 1. Fetch images from DB
    const { data: images, error: fetchError } = await supabase
      .from('property_images')
      .select('url')
      .eq('property_id', propertyId);

    if (fetchError) {
      console.error('Erro ao buscar fotos do imóvel para exclusão:', fetchError);
    } else if (images && images.length > 0) {
      // 2. Extract filenames
      const filesToRemove = images.map(img => {
        const parts = img.url.split('/imoveis/');
        return parts.length > 1 ? parts[1] : null;
      }).filter(Boolean);

      // 3. Remove files from storage bucket 'imoveis'
      if (filesToRemove.length > 0) {
        const { error: removeError } = await supabase.storage.from('imoveis').remove(filesToRemove);
        if (removeError) {
          console.error('Erro ao remover arquivos do storage:', removeError);
        }
      }
    }
  } catch (err) {
    console.error('Erro inesperado na remoção de fotos:', err);
  }

  // 4. Excluir o imóvel
  return await supabase.from('properties').delete().eq('id', propertyId);
}
