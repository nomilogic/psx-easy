import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Bot } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const AI_MODELS = [
  { value: "gpt-5", label: "GPT-5 (OpenAI - Latest)", provider: "OpenAI" },
  { value: "gpt-4o", label: "GPT-4o (OpenAI)", provider: "OpenAI" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo (OpenAI)", provider: "OpenAI" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro (Google)", provider: "Google" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (Google)", provider: "Google" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash (Google)", provider: "Google" },
];

export default function AITest() {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("gpt-5");
  const [htmlOutput, setHtmlOutput] = useState("");

  const generateMutation = useMutation({
    mutationFn: async (data: { prompt: string; model: string }) => {
      const response = await apiRequest("POST", "/api/ai-test", data);
      const result = await response.json();
      return result;
    },
    onSuccess: (data: { html: string }) => {
      setHtmlOutput(data.html);
    },
  });

  const handleGenerate = () => {
    if (prompt.trim() && selectedModel) {
      generateMutation.mutate({ prompt, model: selectedModel });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600" />
            AI HTML Generator
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Enter a prompt and let AI generate HTML with Tailwind CSS styling
          </p>
        </div>

        {/* Input Section */}
        <Card className="shadow-lg border-blue-100 dark:border-blue-900">
          <CardHeader>
            <CardTitle>Prompt Input</CardTitle>
            <CardDescription>
              Describe what you want to create (e.g., "Create a pricing table with 3 tiers" or "Build a hero section with gradient background")
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                AI Model
              </label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger data-testid="select-model" className="w-full">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span>{model.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Prompt
              </label>
              <Textarea
                data-testid="input-prompt"
                placeholder="Enter your prompt here... (e.g., 'Create a beautiful profile card with an avatar, name, title, and social media links')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px] text-base"
              />
            </div>
            <Button
              data-testid="button-generate"
              onClick={handleGenerate}
              disabled={!prompt.trim() || !selectedModel || generateMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating with {AI_MODELS.find(m => m.value === selectedModel)?.label}...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate HTML
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        {htmlOutput && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* HTML Code */}
            <Card className="shadow-lg border-green-100 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">HTML Code (Editable)</CardTitle>
                <CardDescription>Edit the code and see changes in the preview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  data-testid="output-html-code"
                  value={htmlOutput}
                  onChange={(e) => setHtmlOutput(e.target.value)}
                  className="min-h-[400px] font-mono text-sm bg-slate-900 dark:bg-slate-950 text-slate-100 border-slate-700"
                />
                <Button
                  data-testid="button-copy"
                  onClick={() => {
                    navigator.clipboard.writeText(htmlOutput);
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Copy to Clipboard
                </Button>
              </CardContent>
            </Card>

            {/* Rendered Preview */}
            <Card className="shadow-lg border-purple-100 dark:border-purple-900">
              <CardHeader>
                <CardTitle className="text-purple-700 dark:text-purple-400">Live Preview</CardTitle>
                <CardDescription>See how your HTML looks rendered</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  data-testid="output-preview"
                  className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 min-h-[300px]"
                  dangerouslySetInnerHTML={{ __html: htmlOutput }}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error Display */}
        {generateMutation.isError && (
          <Card className="shadow-lg border-red-100 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
            <CardContent className="pt-6">
              <p className="text-red-600 dark:text-red-400" data-testid="text-error">
                Error: Failed to generate HTML. Please try again.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
