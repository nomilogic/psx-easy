
export async function generateHTMLContentPollinations(prompt: string, model: string = "openai"): Promise<string> {
  try {
    // Enhanced system instruction for HTML generation
    const enhancedPrompt = `Create a complete, well-structured HTML page with the following requirements:
1. Use semantic HTML5 elements
2. Include inline CSS styling or Tailwind CSS classes
3. Make it responsive and visually appealing
4. Ensure all data is authentic and accurate
5. Include proper headings, sections, and content structure

User Request: ${prompt}

Return ONLY the HTML content, no markdown formatting or code blocks.`;

    // Pollinations.AI text generation endpoint
    const url = `https://text.pollinations.ai/${encodeURIComponent(enhancedPrompt)}?model=${model}&json=false`;
    
    console.log(`Calling Pollinations API with model: ${model}`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,text/plain,*/*',
        'User-Agent': 'Mozilla/5.0 (compatible; ReplitApp/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Pollinations API error: ${response.status} ${response.statusText}`);
    }

    let content = await response.text();
    
    // Log the response for debugging
    console.log(`Pollinations API response length: ${content.length} characters`);
    
    // Clean up the response - remove markdown code blocks if present
    content = content.replace(/```html\n?/gi, '').replace(/```\n?/g, '').trim();
    
    // If the response doesn't look like HTML, wrap it in basic HTML structure
    if (!content.includes('<html') && !content.includes('<!DOCTYPE')) {
      // Check if it has some HTML tags
      if (content.includes('<div') || content.includes('<section') || content.includes('<p>')) {
        content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Content</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="bg-gray-50 p-6">
  ${content}
</body>
</html>`;
      } else {
        // Plain text response - format it nicely
        content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Generated Content</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 p-8">
  <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
    <div class="prose prose-lg">
      ${content.split('\n').map(line => `<p>${line}</p>`).join('\n')}
    </div>
  </div>
</body>
</html>`;
      }
    }
    
    return content || "<p>No content generated</p>";
  } catch (error) {
    console.error("Error generating HTML content with Pollinations:", error);
    throw new Error(`Failed to generate HTML content with Pollinations: ${error instanceof Error ? error.message : String(error)}`);
  }
}
