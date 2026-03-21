import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import audioRoutes from "./routes/audio.js";
import fs from "fs";
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/audio", audioRoutes);
app.use('/uploads', express.static('uploads'));

app.get("/", (req, res) => {
    res.send("Hello World!");
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message,
        code: err.code // Aquí verás si es 'ENOENT' (falta ffmpeg)
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});