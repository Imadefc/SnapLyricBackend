import ffmpeg from "fluent-ffmpeg";

export const audioSlice = (pathinicio, pathfin, audio, inicio, duracion) => {
    ffmpeg(pathinicio + audio)
        .outputOptions(`-ss ${inicio}`)
        .outputOptions(`-t ${duracion}`)
        .output(pathfin + audio)
        .on("end", () => {
            console.log("Audio cortado exitosamente");
        })
        .on("error", (err) => {
            console.log("Error al cortar el audio: " + err.message);
        })
        .run();
}