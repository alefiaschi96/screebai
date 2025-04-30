import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Immagine mancante' },
        { status: 400 }
      );
    }

    // Call GPT-4 Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Guarda questo disegno e rispondi con UNA SOLA PAROLA che descrive cosa vedi." },
            {
              type: "image_url",
              image_url: {
                "url": imageBase64,
              }
            }
          ]
        }
      ],
      max_tokens: 10,
    });

    // Extract the single word response
    const result = (response.choices[0]?.message?.content?.trim().toLowerCase() || "Indefinito").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Error analyzing drawing:', error);
    return NextResponse.json(
      { error: 'Errore durante l\'analisi dell\'immagine' },
      { status: 500 }
    );
  }
}
