"use client";

/**
 * Analyzes an image using GPT-4 Vision via our API endpoint
 * @param imageBase64 - Base64 encoded image data
 * @returns A single word describing what's in the image
 */
export async function analyzeDrawing(imageBase64: string): Promise<string> {
  try {
    console.log("DISEGNO", JSON.stringify({ imageBase64 }));
    // Chiamata all'API locale che gestisce l'interazione con OpenAI
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
      throw new Error(`Errore API: ${response.status}`);
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Errore durante l'analisi del disegno:", error);
    throw error;
  }
}
