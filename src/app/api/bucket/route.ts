import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

/**
 * Estrae il percorso del file e il nome del bucket da un URL di Supabase Storage
 * @param url - URL dell'immagine in Supabase Storage
 * @returns Un oggetto con bucketName e filePath, o null se l'URL non è valido
 */
function extractStoragePathFromUrl(url: string): { bucketName: string; filePath: string } | null {
  try {
    // Verifica che l'URL sia valido
    const urlObj = new URL(url);
    
    // Verifica che sia un URL di Supabase Storage
    if (!urlObj.pathname.includes('/storage/v1/object/public/')) {
      console.error("L'URL non sembra essere un URL di Supabase Storage");
      return null;
    }
    
    // Il pattern dell'URL di Supabase Storage è:
    // /storage/v1/object/public/BUCKET_NAME/FILE_PATH
    const parts = urlObj.pathname.split('/storage/v1/object/public/');
    if (parts.length !== 2 || !parts[1]) {
      console.error("Formato URL non valido");
      return null;
    }
    
    // Ora parts[1] contiene "BUCKET_NAME/FILE_PATH"
    const pathParts = parts[1].split('/');
    if (pathParts.length < 1) {
      console.error("Percorso file non valido");
      return null;
    }
    
    // Il primo elemento è il nome del bucket
    const bucketName = pathParts[0];
    
    // Il resto è il percorso del file
    const filePath = pathParts.slice(1).join('/');
    
    return { bucketName, filePath };
  } catch (error) {
    console.error("Errore durante l'estrazione del percorso:", error);
    return null;
  }
}

/**
 * API per verificare e creare un bucket in Supabase Storage
 * @route GET /api/bucket?name=nome_bucket
 */
export async function GET(request: NextRequest) {
  try {
    // Ottieni il nome del bucket dalla query string
    const searchParams = request.nextUrl.searchParams;
    const bucketName = searchParams.get("name");

    if (!bucketName) {
      return NextResponse.json({ error: "Nome bucket non specificato" }, { status: 400 });
    }

    // Crea un client Supabase con la chiave di servizio per avere permessi completi
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Verifica se il bucket esiste
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error("Errore durante la verifica dei bucket:", listError);
      return NextResponse.json(
        { error: "Errore durante la verifica dei bucket" },
        { status: 500 }
      );
    }
    
    // Cerca il bucket specificato
    const existingBucket = buckets?.find(bucket => bucket.name === bucketName);
    
    // Se il bucket non esiste, crealo
    if (!existingBucket) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true, // Rende il bucket accessibile pubblicamente
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        console.error("Errore durante la creazione del bucket:", createError);
        return NextResponse.json(
          { error: "Errore durante la creazione del bucket" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ 
        message: `Bucket '${bucketName}' creato con successo`, 
        created: true,
        buckets: buckets
      });
    }
    
    return NextResponse.json({ 
      message: `Bucket '${bucketName}' già esistente`, 
      created: false,
      buckets: buckets
    });
  } catch (error) {
    console.error("Errore:", error);
    return NextResponse.json(
      { error: "Errore durante l'operazione" },
      { status: 500 }
    );
  }
}

/**
 * API per eliminare un'immagine da Supabase Storage dato il suo URL pubblico
 * @route DELETE /api/bucket
 */
export async function DELETE(request: NextRequest) {
  try {
    // Ottieni i dati dalla richiesta
    const data = await request.json();
    const { imageUrl } = data;

    if (!imageUrl) {
      return NextResponse.json({ error: "URL immagine non specificato" }, { status: 400 });
    }

    // Estrai il percorso del file e il nome del bucket dall'URL
    const pathInfo = extractStoragePathFromUrl(imageUrl);
    if (!pathInfo) {
      return NextResponse.json({ error: "Impossibile estrarre il percorso dell'immagine dall'URL" }, { status: 400 });
    }

    const { bucketName, filePath } = pathInfo;

    // Crea un client Supabase con la chiave di servizio per avere permessi completi
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Elimina il file da Supabase Storage
    const { error: deleteError } = await supabaseAdmin.storage
      .from(bucketName)
      .remove([filePath]);

    if (deleteError) {
      console.error("Errore durante l'eliminazione dell'immagine:", deleteError);
      return NextResponse.json(
        { error: "Errore durante l'eliminazione dell'immagine" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Immagine eliminata con successo"
    });
  } catch (error) {
    console.error("Errore:", error);
    return NextResponse.json(
      { error: "Errore durante l'operazione" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Ottieni i dati dalla richiesta
    const data = await request.json();
    const { imageBase64, word, bucketName } = data;

    if (!bucketName) {
      return NextResponse.json({ error: "Nome bucket non specificato" }, { status: 400 });
    }

    if (!imageBase64 || !imageBase64.startsWith("data:image/")) {
      return NextResponse.json({ error: "Formato immagine non valido" }, { status: 400 });
    }

    // Crea un client Supabase con la chiave di servizio per avere permessi completi
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    );

    // Verifica se il bucket esiste
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error("Errore durante la verifica dei bucket:", listError);
      return NextResponse.json(
        { error: "Errore durante la verifica dei bucket" },
        { status: 500 }
      );
    }
    
    // Cerca il bucket specificato
    const existingBucket = buckets?.find(bucket => bucket.name === bucketName);
    
    // Se il bucket non esiste, crealo
    if (!existingBucket) {
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true, // Rende il bucket accessibile pubblicamente
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        console.error("Errore durante la creazione del bucket:", createError);
        return NextResponse.json(
          { error: "Errore durante la creazione del bucket" },
          { status: 500 }
        );
      }
    }

    // Estrai i dati dell'immagine dalla stringa base64
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Genera un nome file unico
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const wordSafe = word ? word.replace(/[^a-z0-9]/gi, "_").toLowerCase() : "unknown";
    const uniqueId = uuidv4().slice(0, 8);
    const filename = `${wordSafe}_${timestamp}_${uniqueId}.png`;

    // Crea la cartella public se non esiste
    try {
      await supabaseAdmin.storage.from(bucketName).list("public");
    } catch (error) {
      console.error("Errore durante la creazione della cartella public:", error);
      // Se la cartella non esiste, crea un file vuoto per inizializzarla
      await supabaseAdmin.storage
        .from(bucketName)
        .upload("public/.keep", new Uint8Array(0), {
          contentType: "text/plain",
          upsert: true,
        });
    }

    // Carica il file su Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(`public/${filename}`, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("Errore durante il caricamento dell'immagine:", uploadError);
      return NextResponse.json(
        { error: "Errore durante il caricamento dell'immagine" },
        { status: 500 }
      );
    }

    // Ottieni l'URL pubblico dell'immagine
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(`public/${filename}`);

    return NextResponse.json({
      success: true,
      imageUrl: publicUrlData.publicUrl,
      message: "Immagine caricata con successo"
    });
  } catch (error) {
    console.error("Errore:", error);
    return NextResponse.json(
      { error: "Errore durante l'operazione" },
      { status: 500 }
    );
  }
}
