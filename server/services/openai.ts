import OpenAI from "openai";

// DON'T DELETE THIS COMMENT
// Follow these instructions when using this blueprint:
// - Note that the newest OpenAI model is "gpt-5" which was released August 7, 2025
//   - do not change this unless explicitly requested by the user

// This is using OpenAI's API, which points to OpenAI's API servers and requires your own API key.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateHTMLContentOpenAI(prompt: string, model: string = "gpt-5"): Promise<string> {
  try {
    const systemPrompt = `You are an expert web developer. Generate clean, well-structured HTML content based on the user's request. 
The HTML should be ready to render and can include Tailwind CSS classes for styling.
Return ONLY the HTML content without any markdown code blocks or explanations.
Make sure the HTML is semantic and accessible.`;

    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content || "<p>No content generated</p>";
  } catch (error) {
    console.error("Error generating HTML content with OpenAI:", error);
    throw new Error(`Failed to generate HTML content with OpenAI: ${error}`);
  }
}
