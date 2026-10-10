import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "GEMINI_API_KEY is not set — chat/knowledge-base features will fail until it's added to .env",
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default ai;

// Centralized model names so upgrading (e.g. gemini-2.5-flash -> a newer
// flash model) only ever means changing it in one place.
export const MODELS = {
  // text-embedding-004 was deprecated/removed by Google — gemini-embedding-001
  // is its replacement (also free-tier). Output is 3072-dim instead of 768,
  // which is fine here since query + document embeddings both use this same
  // model/dimension consistently.
  EMBEDDING: "gemini-embedding-001",
   CHAT_FALLBACK_CHAIN: [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
  ],
};