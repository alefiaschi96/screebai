"use client";

/**
 * Verifica se una stringa è un URL valido
 * @param str - La stringa da verificare
 * @returns true se è un URL valido, false altrimenti
 */
function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch (e) {
    console.error("Errore durante la verifica dell'URL:", e);
    return false;
  }
}

/**
 * Analyzes an image using GPT-4 Vision via our API endpoint
 * @param imageSource - Base64 encoded image data or URL to an image
 * @param locale - The language locale ("it" or "en")
 * @returns A single word describing what's in the image
 */
export async function analyzeDrawing(imageSource: string, locale: string = "it"): Promise<string> {
  try {
    // Verifica se l'input è un URL o un'immagine base64
    const isUrl = isValidUrl(imageSource);
    const isBase64 = imageSource.startsWith("data:image/");
    
    if (!isUrl && !isBase64) {
      const errorMessage = locale === "en"
        ? "Invalid image format. Must be a URL or a base64 image"
        : "Formato immagine non valido. Deve essere un URL o un'immagine in formato base64";
      console.warn(errorMessage);
    }
    
    // Chiamata all'API locale che gestisce l'interazione con OpenAI
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        imageBase64: imageSource,
        locale: locale
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Errore API: ${errorData.error || response.statusText}`);
    }

    const data = await response.json();
    return data.result || "";
  } catch (error) {
    console.error("Errore durante l'analisi dell'immagine:", error);
    throw error;
  }
}
