import ffmpeg from "fluent-ffmpeg";

export const audioSlice = (pathinicio, pathfin, inicio, duracion) => {
    ffmpeg(pathinicio)
        .setStartTime(inicio)
        .setDuration(duracion)
        .output(Date.now() + pathfin)
        .on("end", () => {
            console.log("Audio cortado exitosamente");
        })
        .on("error", (err) => {
            console.log("Error al cortar el audio: " + err.message);
        })
        .run();
}

export const getAudioDuration = (audio) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(audio, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration);
        });
    });
}