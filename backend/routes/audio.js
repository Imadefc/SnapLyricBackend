import express from "express";
import multer from "multer";
import { audioSplit } from "../services/audio.js";
import fs from "fs";
import path from "path";
import { generarKaraokeASS } from "../services/karaokeass.js";
import { obtenerLetrasIA } from "../services/transcribeServices.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });
//cortar audio
router.post("/audioSlice", upload.single("audio"), async (req, res) => {
    const { inicio, duracion } = req.body;
    const audio = req.file;
    let inicioInt = parseInt(inicio);
    let duracionInt = parseInt(duracion);

    if (!audio || !inicio || !duracion) {
        return res.status(400).send("Faltan datos");
    }

    const inputPath = audio.path

    const outputfileName = `slice-${Date.now()}.mp3`
    const outputPath = path.join("uploads/", outputfileName);

    if (inicioInt < 0 || duracionInt <= 0) {
        return res.status(400).send("Datos invalidos");
    }

    const duracionCancion = await getAudioDuration(inputPath);
    if (inicioInt + duracionInt > duracionCancion) {
        return res.status(400).send("Datos invalidos");
    }

    await audioSlice(inputPath, outputPath, inicioInt, duracionInt);
    res.download(outputPath, 'recorte.mp3', (err) => {
        if (err) {
            console.error("Error al enviar el archivo:", err);
            if (!res.headersSent) res.status(500).send("Error en la descarga");
        }
    });
});
//descomponer audio en  7 partes
router.post("/audioDecompose", upload.fields([{ name: "audio", maxCount: 1 }, { name: "image", maxCount: 1 }]), async (req, res) => {
    const files = req.files;

    if (!files || !files['audio'] || !files['image']) {
        return res.status(400).json({
            error: "Faltan archivos. Debes enviar 'audio' e 'image'."
        });
    }

    const audioFile = req.files['audio'][0];
    const imageFile = req.files['image'][0];


    const audioPath = audioFile.path;
    const imagePath = imageFile.path;

    const outputfileName = `visualizacion-${Date.now()}.mp4`;

    const outputPath = path.join("uploads/", outputfileName);
    await audioSplit(audioPath, imagePath, outputPath, true, null);
    res.download(outputPath, 'visualizacion.mp4', (err) => {
        if (err) {
            console.error("Error al enviar el archivo:", err);
            if (!res.headersSent) res.status(500).send("Error en la descarga");
        }
    });
});

router.post("/:isImage", upload.fields([{ name: "audio", maxCount: 1 }, { name: "image", maxCount: 1 }]), async (req, res) => {
    try {
        // 1. Recogemos los archivos subidos
        const audioPath = req.files.audio[0].path;
        const imagePath = req.files.image[0].path;

        // 🚨 EL ARREGLO MÁGICO 🚨
        // Comparamos el texto exacto. Si en la URL pone "true", es true. Todo lo demás será false.
        const isImage = req.params.isImage === "true";

        // Creamos rutas únicas para que los usuarios no se pisen los archivos
        const timestamp = Date.now();
        const videoOutputPath = path.resolve('uploads', `video_${timestamp}.mp4`);
        const assOutputPath = path.resolve('uploads', `letras_${timestamp}.ass`);

        // --- FASE 1: EL CEREBRO ---
        console.log("🧠 1. Escuchando la canción con IA...");
        const transcripcion = await obtenerLetrasIA(audioPath);

        // --- FASE 2: EL PINTOR ---
        console.log("🎨 2. Diseñando el archivo de subtítulos karaoke...");
        generarKaraokeASS(transcripcion, assOutputPath);

        // --- FASE 3: EL MOTOR ---
        console.log(`🎬 3. Renderizando el video final con FFmpeg... (Modo Imagen: ${isImage})`);

        // Pasamos la variable ya convertida en booleano real
        await audioSplit(audioPath, imagePath, videoOutputPath, assOutputPath, isImage);

        console.log("✅ ¡HACKATÓN SUPERADO! Video listo.");

        // Devolvemos la ruta del video al frontend para que lo reproduzca
        res.status(200).json({
            mensaje: "Video creado con éxito",
            videoUrl: videoOutputPath
        });

    } catch (error) {
        console.error("❌ Error en la tubería principal:", error);
        res.status(500).json({ error: "Fallo al procesar el video" });
    }
});

export default router;