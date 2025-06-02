import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Inizializza il client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, locale = "it" } = await request.json();

    if (!imageBase64) {
      const errorMessage = locale === "en" ? "Missing image" : "Immagine mancante";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Determina se l'input è un URL o un'immagine base64
    const isUrl = isValidUrl(imageBase64);
    const isBase64 = imageBase64.startsWith("data:image/");

    // Verifica che l'input sia valido (URL o base64)
    if (!isUrl && !isBase64) {
      const errorMessage = locale === "en" 
        ? "Invalid image format. Must be a URL or a base64 image" 
        : "Formato immagine non valido. Deve essere un URL o un'immagine in formato base64";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Prepara il prompt in base alla lingua richiesta
    const promptText = locale === "en"
      ? `This is a hand-drawn image, like those in a children's game. Respond with ONLY ONE ENGLISH WORD that directly describes what it represents. If you don't receive any image, respond with "none".`
      : `Questa è un'immagine disegnata a mano, come quelle di un gioco per bambini. Rispondi con UNA SOLA PAROLA ITALIANA che descrive in modo diretto ciò che rappresenta. Se non ricevi nessuna immagine, rispondi con "nessuna".`;

    const openaiRequest = {
      model: "gpt-4o",
      messages: [
        {
          role: "user" as const,
          content: [
            {
              type: "text" as const,
              text: promptText,
            },
            {
              type: "image_url" as const,
              image_url: {
                url: imageBase64,
                detail: "high" as const,
              },
            },
          ],
        },
      ],
      max_tokens: 20,
    }

    // Chiamata all'API GPT-4o con immagine inline
    const response = await openai.chat.completions.create(openaiRequest);

    const raw =
      response.choices[0]?.message?.content?.trim().toLowerCase() ||
      "indefinito";

    const result = raw.replace(/[^\w\s]/gi, "");

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Errore durante l'analisi dell'immagine:", error);
    return NextResponse.json(
      { error: "Errore durante l'analisi dell'immagine" },
      { status: 500 }
    );
  }
}
