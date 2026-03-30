import express from "express";
import multer from "multer";
import { audioSlice, getAudioDuration, audioDecompose, audioSplit } from "../services/audio.js";
import fs from "fs";
import path from "path";

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

export default router;