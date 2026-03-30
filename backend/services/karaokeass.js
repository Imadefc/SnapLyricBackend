import fs from 'fs';

export const generarKaraokeASS = (wordsArray, outputPath) => {
    console.log("🎨 Generando archivo de subtítulos (Escudo Anti-Solapamiento)...");

    let assContent = `[Script Info]
ScriptType: v4.00+
PlayResX: 720
PlayResY: 1280

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, OutlineColour, BackColour, Bold, Alignment, MarginV
Style: Karaoke,Arial,45,&H00FFFFFF,&H00000000,&H80000000,-1,5,250

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`;

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = Math.floor(seconds % 60).toString().padStart(2, '0');
        const cs = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
        return `${h}:${m}:${s}.${cs}`;
    };

    const chunkSize = 5;

    // 1. Primero agrupamos las palabras en bloques reales
    const chunks = [];
    for (let i = 0; i < wordsArray.length; i += chunkSize) {
        chunks.push(wordsArray.slice(i, i + chunkSize));
    }

    // 2. Procesamos cada bloque asegurando que los tiempos encajen como piezas de Tetris
    chunks.forEach((chunk, chunkIndex) => {
        const nextChunk = chunks[chunkIndex + 1];

        // El bloque termina exactamente cuando empieza el siguiente (o 1 segundo después si es el último)
        const chunkEndTime = nextChunk ? nextChunk[0].start : chunk[chunk.length - 1].end + 1.0;

        chunk.forEach((activeWord, activeIndex) => {
            const nextWord = chunk[activeIndex + 1];

            // Inicio: Cuando la IA dice que empieza la palabra
            const startNum = activeWord.start;

            // 🚨 EL TRUCO ANTI-SOLAPAMIENTO 🚨
            // Fin: EXACTAMENTE cuando empieza la siguiente palabra. Nunca se pisarán.
            let endNum = nextWord ? nextWord.start : chunkEndTime;

            // Medida de seguridad extra por si la IA se vuelve loca y pone un inicio anterior al fin
            if (endNum <= startNum) {
                endNum = startNum + 0.1;
            }

            const lineStart = formatTime(startNum);
            const lineEnd = formatTime(endNum);

            let textLine = "";
            chunk.forEach((w, wIndex) => {
                if (wIndex === activeIndex) {
                    textLine += `{\\c&H00FFFF&}${w.word} `; // Amarillo
                } else {
                    textLine += `{\\c&HFFFFFF&}${w.word} `; // Blanco
                }
            });

            assContent += `Dialogue: 0,${lineStart},${lineEnd},Karaoke,,0,0,0,,${textLine.trim()}\n`;
        });
    });

    fs.writeFileSync(outputPath, assContent);
    console.log("✅ ¡Archivo .ass creado! (0% Solapamientos)");

    return outputPath;
};