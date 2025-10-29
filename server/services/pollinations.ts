
export async function generateHTMLContentPollinations(prompt: string, model: string = "openai"): Promise<string> {
  try {
    // Pollinations.AI text generation endpoint
    // Format: https://text.pollinations.ai/{prompt}?model={model}&json=false
    const enhancedPrompt = `Generate clean, well-structured HTML content based on this request: ${prompt}. Return ONLY the HTML content without any markdown code blocks or explanations. The HTML should be ready to render and can include Tailwind CSS classes for styling.`;
    
    const url = `https://text.pollinations.ai/${encodeURIComponent(enhancedPrompt)}?model=${model}&json=false`;
    
    console.log(`Calling Pollinations API with model: ${model}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,text/plain,*/*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      console.error(`Pollinations API error: ${response.status} ${response.statusText}`);
      throw new Error(`Pollinations API error: ${response.status}`);
    }

    const htmlContent = await response.text();
    console.log(`Pollinations API returned ${htmlContent.length} characters`);
    
    return htmlContent || "<p>No content generated</p>";
  } catch (error) {
    console.error("Error generating HTML content with Pollinations:", error);
    throw new Error(`Failed to generate HTML content with Pollinations: ${error}`);
  }
}
