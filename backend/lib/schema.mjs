import { z } from "zod";

export const AnalysisSchema = z.object({
  skills_match: z.object({
    score: z.number().min(0).max(100),
    explanation: z.string(),
  }),
  experience_match: z.object({
    score: z.number().min(0).max(100),
    explanation: z.string(),
  }),
  education_match: z.object({
    score: z.number().min(0).max(100),
    explanation: z.string(),
  }),
  overall_match: z.object({
    score: z.number().min(0).max(100),
    explanation: z.string(),
  }),
  suggestions: z.array(z.string()),
});