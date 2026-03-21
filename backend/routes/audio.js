import express from "express";
import multer from "multer";
import { audioSlice, getAudioDuration } from "../services/audio.js";
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
    const outputPath = path.join("../uploads/", outputfileName);

    if (inicioInt < 0 || duracionInt <= 0) {
        return res.status(400).send("Datos invalidos");
    }

    const duracionCancion = await getAudioDuration(inputPath);
    if (inicioInt + duracionInt > duracionCancion) {
        return res.status(400).send("Datos invalidos");
    }

    await audioSlice(inputPath, outputPath, inicioInt, duracionInt);
    res.send({
        message: "Audio cortado exitosamente",
        audio: outputPath
    });
});

export default router;