import { GoogleGenAI } from "@google/genai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest Gemini model series is "gemini-2.5-flash" or gemini-2.5-pro"
//   - do not change this unless explicitly requested by the user

// This API key is from Gemini Developer API Key, not vertex AI API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateHTMLContent(prompt: string): Promise<string> {
  try {
    const systemPrompt = `You are an expert web developer. Generate clean, well-structured HTML content based on the user's request. 
The HTML should be ready to render and can include Tailwind CSS classes for styling.
Return ONLY the HTML content without any markdown code blocks or explanations.
Make sure the HTML is semantic and accessible.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
      },
      contents: prompt,
    });

    return response.text || "<p>No content generated</p>";
  } catch (error) {
    console.error("Error generating HTML content:", error);
    throw new Error(`Failed to generate HTML content: ${error}`);
  }
}
