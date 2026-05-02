import express from "express";
import { buildMessages } from "../lib/promptBuilder.mjs";
import { sendChat } from "../lib/aiClient.mjs";
import { safeParseJSON } from "../lib/parser.mjs";
import { AnalysisSchema } from "../lib/schema.mjs";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { resume, jobDescription } = req.body;

    if (!resume || !jobDescription) {
      return res.status(400).json({
        error: "Resume and job description are required"
      });
    }

    const messages = buildMessages({ resume, jobDescription });

    const raw = await sendChat(messages);

    console.log("RAW MODEL OUTPUT:\n", raw);

    const parsed = safeParseJSON(raw);

    if (!parsed) {
      return res.status(500).json({
        error: "Invalid JSON from model",
        raw_output: raw
      });
    }
    
    const result = AnalysisSchema.safeParse(parsed);

    if (!result.success) {
      console.log("Retrying due to invalid schema...");

      const retryRaw = await sendChat(messages);
      const retryParsed = safeParseJSON(retryRaw);

      const retryResult = AnalysisSchema.safeParse(retryParsed);

      if (!retryResult.success) {
        return res.status(500).json({
          error: "Model failed twice",
          raw_output: retryParsed
        });
      }

      return res.json({ analysis: retryResult.data });
    }

    res.json({ analysis: result.data });

  } catch (error) {
    res.status(500).json({
      error: "Failed to analyze",
      details: error.message
    });
  }
});

export default router;