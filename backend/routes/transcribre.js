import { Router } from "express";
import multer from "multer";
import { obtenerLetrasIA } from "../services/transcribeServices.js";


const router = Router();
const upload = multer({ dest: "uploads/" })

router.post("/", upload.single("audio"), (req, res) => {
    if (!req.file) {
        return res.status(400).send("No se envio ningun audio");
    }
    const audio = req.file;
    const transcription = obtenerLetrasIA(audio.path);
    res.json(transcription);
})

export default router;