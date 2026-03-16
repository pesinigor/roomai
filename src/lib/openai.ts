import OpenAI from "openai";

// Key is validated at runtime (inside API routes), not at build time
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "missing",
});

export default openai;
