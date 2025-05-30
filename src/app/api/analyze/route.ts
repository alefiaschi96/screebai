import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Inizializza il client OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    console.log("MIME TYPE:", imageBase64?.substring(0, 30));
    console.log("IMAGE LENGTH:", imageBase64?.length);

    if (!imageBase64 || !imageBase64.startsWith("data:image/")) {
      return NextResponse.json({ error: "Immagine mancante o formato non valido" }, { status: 400 });
    }

    // Chiamata all'API GPT-4o con immagine inline
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Questa è un'immagine disegnata a mano, come quelle di un gioco per bambini. Rispondi con UNA SOLA PAROLA italiana che descrive in modo diretto ciò che rappresenta. Se non capisci, rispondi con "nessuna".`,
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64, // es. data:image/png;base64,...
                detail: "high",   // IMPORTANTE per le immagini inline
              },
            },
          ],
        },
      ],
      max_tokens: 10,
      temperature: 0,
    });

    const raw =
      response.choices[0]?.message?.content?.trim().toLowerCase() ||
      "indefinito";

    const result = raw.replace(/[^\w\s]/gi, "");

    console.log("RISPOSTA GREZZA:", response.choices[0]?.message?.content);
    console.log("RISULTATO PULITO:", result);

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Errore durante l'analisi dell'immagine:", error);
    return NextResponse.json(
      { error: "Errore durante l'analisi dell'immagine" },
      { status: 500 }
    );
  }
}
