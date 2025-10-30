import fetch from "node-fetch";

export async function generateHTMLContentPollinations(
  prompt: string,
  model: string = "openai",
): Promise<string> {
  try {
    console.log(`Pollinations: Generating HTML with model ${model}`);

    const enhancedPrompt = `${prompt}

You are generating HTML content for a web application. 
Return ONLY valid HTML code
Include inline styles or Tailwind CSS classes for styling
Make it visually appealing and responsive
Ensure all data is authentic and accurate
If data is not available, do not include placeholder text

Return ONLY the HTML content, no markdown formatting or code blocks`;

    // Pollinations.AI text generation endpoint - using the model attribute correctly
    const url = `https://text.pollinations.ai/${encodeURIComponent(enhancedPrompt)}?model=${encodeURIComponent(model)}&json=false`;

    console.log(`Calling Pollinations API with URL: ${url}`);
    console.log(`Using model: ${model}`);
    const token="XOs00Fr01SBhK - LR";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/117.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9",
        "Accept-Language": "en-US,en;q=0.5",
        "Authorization": `Bearer ${token}`,
      },
    });

    console.log(`Pollinations API response status: ${response.status}`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Pollinations API error response: ${errorBody}`);
      throw new Error(
        `Pollinations API error: ${response.status} ${response.statusText} - ${errorBody}`,
      );
    }

    let content = await response.text();

    // Log the response for debugging
    console.log(
      `Pollinations API response length: ${content.length} characters`,
    );
    console.log(`First 200 chars: ${content.substring(0, 200)}`);

    // Clean up the response - remove markdown code blocks if present
    content = content
      .replace(/```html\n?/gi, "")
      .replace(/```\n?/g, "")
      .trim();

    return content || "<p>No content generated</p>";
  } catch (error) {
    console.error("Error generating HTML content with Pollinations:", error);
    throw new Error(`Failed to generate HTML content: ${error}`);
  }
}
