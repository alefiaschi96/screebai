"use client";

/**
 * Verifica se il bucket esiste e lo crea se necessario tramite API
 * @param bucketName - Nome del bucket da verificare/creare
 * @returns true se il bucket è stato creato o esiste già, false altrimenti
 */
export async function ensureDrawingsBucket(bucketName: string): Promise<boolean> {
  try {
    if (!bucketName) {
      console.error("Bucket name non specificato");
      return false;
    }
    
    // Chiamata all'API per verificare/creare il bucket
    const response = await fetch(`/api/bucket?name=${encodeURIComponent(bucketName)}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Errore API bucket:", errorData);
      return false;
    }
    
    return true; // Se siamo arrivati qui, significa che il bucket esiste o è stato creato
  } catch (error) {
    console.error("Errore durante la verifica/creazione del bucket:", error);
    return false;
  }
}

/**
 * Carica un'immagine base64 su Supabase Storage tramite API
 * @param imageBase64 - L'immagine in formato base64
 * @param word - La parola associata all'immagine
 * @param bucketName - Il nome del bucket in cui caricare l'immagine
 * @returns Il percorso dell'immagine caricata
 */
export async function uploadDrawing(imageBase64: string, word: string, bucketName: string): Promise<string> {
  try {
    if (!bucketName) {
      throw new Error("Bucket name non specificato");
    }
    if (!imageBase64 || !imageBase64.startsWith("data:image/")) {
      throw new Error("Formato immagine non valido");
    }

    // Chiamata all'API per caricare l'immagine
    const response = await fetch("/api/bucket", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageBase64,
        word,
        bucketName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Errore API caricamento immagine:", errorData);
      throw new Error(errorData.error || "Errore durante il caricamento dell'immagine");
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error("Errore durante il salvataggio dell'immagine:", error);
    throw error;
  }
}

/**
 * Elimina un'immagine da Supabase Storage dato il suo URL
 * @param imageUrl - L'URL dell'immagine da eliminare
 * @returns true se l'eliminazione è avvenuta con successo, false altrimenti
 */
export async function deleteDrawing(imageUrl: string): Promise<boolean> {
  try {
    if (!imageUrl) {
      console.error("URL immagine non specificato");
      return false;
    }

    // Chiamata all'API per eliminare l'immagine
    const response = await fetch("/api/bucket", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Errore API eliminazione immagine:", errorData);
      return false;
    }

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Errore durante l'eliminazione dell'immagine:", error);
    return false;
  }
}
