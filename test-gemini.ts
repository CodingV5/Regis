import { GoogleGenAI } from "@google/genai";
async function test() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: "Happy day"
    });
    console.log(response.text);
  } catch (e) {
    console.error("ERROR", e);
  }
}
test();
