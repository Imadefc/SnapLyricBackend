import ffmpeg from "fluent-ffmpeg";
import path from "path";
import { obtenerLetrasIA } from "./transcribeServices.js";

export const audioSlice = (pathinicio, pathfin, inicio, duracion) => {
    return new Promise((resolve, reject) => {
        ffmpeg(pathinicio)
            .setStartTime(inicio)
            .setDuration(duracion)
            .on("end", () => {
                console.log("Audio cortado exitosamente");
                resolve(pathfin);
            })
            .on("error", (err) => {
                console.error("Error al cortar el audio: " + err.message);
                reject(err);
            })
            .save(pathfin);
    });
}

export const getAudioDuration = (audio) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(audio, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration);
        });
    });
}

export const audioDecompose = (audioPath, imagepath, outputPath) => {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(imagepath)
            .inputOptions(['-loop 1', '-t 3'])
            .input(audioPath)
            .outputOptions([
                '-c:v libx264',
                '-preset ultrafast',
                '-pix_fmt yuv420p',
                '-c:a aac',
                '-shortest'
            ])
            .on('start', (cmd) => {
                console.log("🚀 PASO 1 - Iniciando FFmpeg Básico...");
                console.log("Comando:", cmd);
            })
            .on('progress', (p) => {
                console.log(`⏳ Procesando: ${p.timemark}`);
            })
            .on('end', () => {
                console.log("✅ ¡PASO 1 SUPERADO! Video generado.");
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error("❌ Error en el Paso 1:", err.message);
                reject(err);
            })
            .save(outputPath);
    });
}

export const audioSplit = (audioPath, imagePath, outputPath, complexFilter, duration) => {
    return new Promise((resolve, reject) => {
        let duracion;
        if (duration) {
            duracion = duration;
        } else {
            duracion = 10;
        }

        const transcripcion = generarTranscripcionLocal(audioPath);

        console.log(transcripcion);

        if (complexFilter) {
            const assPath = path.resolve('uploads', 'letras_animadas.ass');
            const escapedAssPath = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
            const filterStr = [
                "[0:v]scale=720:1280[bg]",
                "[1:a]asplit=2[a_vis][a_out]",
                "[a_vis]showwaves=s=720x200:mode=line:colors=white[vis_raw]",
                "[vis_raw]colorkey=black:0.1:0.1[vis]",
                "[bg][vis]overlay=0:(H-h)[temp_video]",

                // 2. Quitamos el force_style, el archivo .ass ya sabe cómo debe verse y animarse
                `[temp_video]subtitles='${escapedAssPath}'[v_final]`
            ].join(';');
            ffmpeg()
                .input(imagePath)
                .inputOptions(['-loop 1', '-t', duracion])
                .input(audioPath)

                // Le pasamos nuestro filtro simple
                .complexFilter(filterStr)

                .outputOptions([
                    '-map [v_final]',
                    '-map [a_out]',
                    '-c:v libx264',
                    '-preset ultrafast',
                    '-pix_fmt yuv420p',
                    '-c:a aac',
                    '-shortest'
                ])
                .on('start', (cmd) => console.log("🚀 PASO 2 - Iniciando Filtros Básicos..."))
                .on('progress', (p) => console.log(`⏳ Procesando: ${p.timemark}`))
                .on('end', () => {
                    console.log("✅ ¡PASO 2 SUPERADO! Filtros funcionando.");
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    console.error("❌ Error en el Paso 2:", err.message);
                    reject(err);
                })
                .save(outputPath);
        } else {
            ffmpeg()
                .input(imagePath)
                .inputOptions(['-loop 1', '-t', duracion])
                .input(audioPath)


                .outputOptions([
                    '-c:v libx264',
                    '-preset ultrafast',
                    '-pix_fmt yuv420p',
                    '-c:a aac',
                    '-shortest'
                ])
                .on('start', (cmd) => console.log("🚀 PASO 2 - Iniciando Filtros Básicos..."))
                .on('progress', (p) => console.log(`⏳ Procesando: ${p.timemark}`))
                .on('end', () => {
                    console.log("✅ ¡PASO 2 SUPERADO! Filtros funcionando.");
                    resolve(outputPath);
                })
                .on('error', (err) => {
                    console.error("❌ Error en el Paso 2:", err.message);
                    reject(err);
                })
                .save(outputPath);
        }



    });
};

