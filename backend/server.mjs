import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import analyzeRoute from "./routes/analyze.mjs";
import { sendChat } from "./lib/aiClient.mjs";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check
app.get("/", async (req, res) => {
  try {
    const raw = await sendChat([
      { role: "user", content: "Only say: Connected!" }
    ]);
    res.send(raw);
  } catch (err) {
    res.status(500).json({
      error: "Connection failed",
      details: err.message
    });
  }
});

// Mount route
app.use("/analyze", analyzeRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});