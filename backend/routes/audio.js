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
    const duracionCancion = await getAudioDuration(audio.path);
    if (!audio || !inicio || !duracion) {
        return res.status(400).send("Faltan datos");
    }
    if (inicioInt < 0 || duracionInt <= 0) {
        return res.status(400).send("Datos invalidos");
    }
    if (inicioInt + duracionInt > duracionCancion) {
        return res.status(400).send("Datos invalidos");
    }
    const audioPath = path.join("uploads/", audio.name);
    const audioSlicePath = path.join("uploads/", Date.now() + "_audioSlice.mp3");
    await audioSlice(audioPath.path, audioSlicePath, inicioInt, duracionInt);
    res.send({
        message: "Audio cortado exitosamente",
        audio: audioSlicePath
    });
});

export default router;