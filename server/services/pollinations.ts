
export async function generateHTMLContentPollinations(prompt: string, model: string = "openai"): Promise<string> {
  try {
    // Pollinations.AI text generation endpoint
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=${model}&json=false`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,text/plain,*/*',
      },
    });

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status}`);
    }

    const htmlContent = await response.text();
    return htmlContent || "<p>No content generated</p>";
  } catch (error) {
    console.error("Error generating HTML content with Pollinations:", error);
    throw new Error(`Failed to generate HTML content with Pollinations: ${error}`);
  }
}
