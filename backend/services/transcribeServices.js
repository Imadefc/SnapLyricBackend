import fs from 'fs';

export const obtenerLetrasIA = async (audioPath, idioma = "multi") => {
    console.log("🧠 Enviando audio a Deepgram (Modo Nativo HTTP)...");

    // 1. Leemos el archivo físico
    const audioBuffer = fs.readFileSync(audioPath);

    // ⚠️ REEMPLAZA ESTO CON TU API KEY REAL DE DEEPGRAM
    const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;

    try {
        // 2. Hacemos la petición directa a la API (Cero librerías externas)
        const response = await fetch(`https://api.deepgram.com/v1/listen?model=nova-2&language=${idioma}&smart_format=true`, {
            method: "POST",
            headers: {
                "Authorization": `Token ${DEEPGRAM_API_KEY}`,
                // Funciona para mp3, wav, mp4, etc.
                "Content-Type": "audio/mpeg"
            },
            body: audioBuffer
        });

        // 3. Manejamos si Deepgram nos rechaza (ej. API Key incorrecta)
        if (!response.ok) {
            const errorDetails = await response.text();
            throw new Error(`Deepgram API falló: ${response.status} - ${errorDetails}`);
        }

        // 4. Procesamos la respuesta
        const data = await response.json();
        const palabras = data.results.channels[0].alternatives[0].words;

        // 5. Lo dejamos perfecto para nuestro generador .ass
        const palabrasFormateadas = palabras.map(p => ({
            word: p.word,
            start: p.start,
            end: p.end
        }));

        console.log("✅ ¡Deepgram devolvió las letras con éxito!");
        return palabrasFormateadas;

    } catch (err) {
        console.error("❌ Error crítico en IA:", err.message);
        throw err;
    }
};