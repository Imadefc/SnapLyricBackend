import ffmpeg from "fluent-ffmpeg";

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