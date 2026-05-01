import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load SYSTEM prompt once
const systemPrompt = fs.readFileSync(
  path.join(__dirname, "../prompts/SYSTEM.md"),
  "utf-8"
);

export const SYSTEM = {
  role: "system",
  content: systemPrompt
};

export function buildUserMessage(resume, jobDescription) {
  return {
    role: "user",
    content: `
## Job Description
${jobDescription}

## Resume
${resume}

## Output
Return ONLY valid JSON following SYSTEM instructions.
`
  };
}

export function buildMessages({ resume, jobDescription }) {
  return [
    SYSTEM,
    buildUserMessage(resume, jobDescription)
  ];
}