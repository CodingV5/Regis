import { GoogleGenAI, Modality } from "@google/genai";
async function test() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: "Hello" }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } },
        },
      },
    });
    console.log("TTS success, length:", response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data?.length);
  } catch (e) {
    console.error("ERROR", e);
  }
}
test();
