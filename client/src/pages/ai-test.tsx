import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, Bot } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const AI_MODELS = {
  openai: {
    reasoning: [
      { value: "gpt-5", label: "GPT-5" },
      { value: "gpt-5-mini", label: "GPT-5 Mini" },
      { value: "gpt-4o", label: "GPT-4o" },
      { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    ],
    open_weight: [
      { value: "gpt-oss-120b", label: "GPT-OSS-120B" },
      { value: "gpt-oss-20b", label: "GPT-OSS-20B" },
    ],
  },
  gemini: {
    general: [
      { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
      { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    ],
    performance_and_cost: [
      { value: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash Lite" },
      { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
      { value: "gemini-2.0-flash-lite", label: "Gemini 2.0 Flash Lite" },
    ],
    specialized: [
      { value: "gemini-2.5-flash-image", label: "Gemini 2.5 Flash Image" },
    ],
    live_api: [
      { value: "gemini-2.5-flash-live", label: "Gemini 2.5 Flash Live" },
    ],
  },
  groq: {
    fast: [
      { value: "llama-3.3-70b-versatile", label: "Llama 3.3 70B" },
      { value: "llama-3.1-70b-versatile", label: "Llama 3.1 70B" },
      { value: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant" },
      { value: "mixtral-8x7b-32768", label: "Mixtral 8x7B" },
    ],
    specialized: [
      { value: "llama-3.2-90b-vision-preview", label: "Llama 3.2 90B Vision" },
      { value: "llama-3.2-11b-vision-preview", label: "Llama 3.2 11B Vision" },
    ],
  },
  huggingface: {
    popular: [
      { value: "meta-llama/Llama-3.3-70B-Instruct", label: "Llama 3.3 70B Instruct" },
      { value: "meta-llama/Llama-3.1-8B-Instruct", label: "Llama 3.1 8B Instruct" },
      { value: "mistralai/Mistral-7B-Instruct-v0.3", label: "Mistral 7B Instruct" },
      { value: "microsoft/Phi-3-mini-4k-instruct", label: "Phi-3 Mini 4K" },
    ],
    code: [
      { value: "bigcode/starcoder2-15b", label: "StarCoder2 15B" },
      { value: "Salesforce/codegen-16B-mono", label: "CodeGen 16B" },
    ],
  },
};

const getModelLabel = (modelValue: string): string => {
  for (const provider of Object.values(AI_MODELS)) {
    for (const category of Object.values(provider)) {
      const model = category.find((m) => m.value === modelValue);
      if (model) return model.label;
    }
  }
  return modelValue;
};

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
                <SelectContent className="max-h-[400px]">
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase">
                    OpenAI - Reasoning Models
                  </div>
                  {AI_MODELS.openai.reasoning.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span>{model.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase mt-2">
                    OpenAI - Open Weight
                  </div>
                  {AI_MODELS.openai.open_weight.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span>{model.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase mt-2">
                    Gemini - General
                  </div>
                  {AI_MODELS.gemini.general.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span>{model.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase mt-2">
                    Gemini - Performance & Cost
                  </div>
                  {AI_MODELS.gemini.performance_and_cost.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span>{model.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase mt-2">
                    Gemini - Specialized
                  </div>
                  {AI_MODELS.gemini.specialized.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span>{model.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase mt-2">
                    Gemini - Live API
                  </div>
                  {AI_MODELS.gemini.live_api.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span>{model.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase mt-2">
                    Groq - Fast Models
                  </div>
                  {AI_MODELS.groq.fast.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span>{model.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase mt-2">
                    Groq - Specialized
                  </div>
                  {AI_MODELS.groq.specialized.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span>{model.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase mt-2">
                    Hugging Face - Popular
                  </div>
                  {AI_MODELS.huggingface.popular.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <span>{model.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                  
                  <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase mt-2">
                    Hugging Face - Code
                  </div>
                  {AI_MODELS.huggingface.code.map((model) => (
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
                  Generating with {getModelLabel(selectedModel)}...
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
          <div className="space-y-6">
            {/* HTML Code */}
            <Card className="shadow-lg border-green-100 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-green-700 dark:text-green-400">HTML Code (Editable)</CardTitle>
                <CardDescription>Edit the code and see changes in the preview below</CardDescription>
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
