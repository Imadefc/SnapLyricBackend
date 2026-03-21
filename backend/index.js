import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import audioRoutes from "./routes/audio.js";

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});