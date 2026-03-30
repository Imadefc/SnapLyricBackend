import ffmpeg from 'fluent-ffmpeg';

export const audioSplit = (audioPath, visualPath, outputPath, assPath, isImage) => {
    return new Promise((resolve, reject) => {
        const escapedAssPath = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');

        // 1. Preparamos el fondo (tu foto o video) para que ocupe TODA la pantalla [bg]
        const visualFilter = isImage
            ? "[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280[bg]"
            : "[0:v]scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280,fps=30[bg]";

        const filterStr = [
            visualFilter,

            // 2. Extraemos el audio para las ondas
            "[1:a]asplit=2[a_vis][a_out]",

            // 3. Creamos el ecualizador más "bajito" (250px de alto en lugar de 1280)
            "[a_vis]showfreqs=s=720x250:mode=bar:colors=white:fscale=log[vis_raw]",

            // 4. Le quitamos el fondo negro para que solo se vean los rayos blancos
            "[vis_raw]colorkey=black:0.1:0.1[vis_transparente]",

            // 5. 🚨 LA MAGIA DEL PIE DE PÁGINA 🚨
            // Ponemos las ondas SOBRE el fondo. "0:H-h" significa "Pegado a la izquierda (0) y pegado abajo del todo (H-h)"
            "[bg][vis_transparente]overlay=0:H-h:shortest=1[video_combinado]",

            // 6. Planchamos los subtítulos (que ya están programados para salir en el centro)
            `[video_combinado]subtitles=filename='${escapedAssPath}'[v_final]`
        ].join(';');

        let command = ffmpeg();

        if (isImage) {
            command = command.input(visualPath).inputOptions(['-loop 1']);
        } else {
            command = command.input(visualPath);
        }

        command
            .input(audioPath)
            .complexFilter(filterStr)
            .outputOptions([
                '-y', // Sobreescribir sin preguntar
                '-map [v_final]',
                '-map [a_out]',
                '-c:v libx264',
                '-preset ultrafast',
                '-pix_fmt yuv420p',
                '-c:a aac',
                '-shortest'
            ])
            .on('start', (cmd) => {
                console.log(`🚀 Motor FFmpeg: Diseño TikTok (Ondas al pie de la pantalla)`);
            })
            .on('progress', (p) => {
                if (p.timemark) console.log(`⏳ Renderizando: ${p.timemark}`);
            })
            .on('end', () => {
                console.log("✅ ¡VIDEO FINAL COMPLETADO CON ÉXITO!");
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error("❌ Error de FFmpeg:", err.message);
                reject(err);
            })
            .save(outputPath);
    });
};