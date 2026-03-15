
import { AIProvider } from "../types";
import { Logger } from "./Logger";
import { 
  BASE_ROLE, DEEP_THINKING, FIRST_COMMAND_COMPLETION, STRICT_SCOPE_EDITING, 
  UNIT_TESTING, DEPENDENCY_GRAPH, SURGICAL_EDITING, PATCH_MODE_RULE, 
  MANDATORY_RULES, DESIGN_SYSTEM, PLANNING_PROMPT, CODING_PROMPT, 
  REVIEW_PROMPT, OPTIMIZATION_PROMPT, PERFORMANCE_PROMPT, UI_UX_PROMPT,
  RESPONSE_FORMAT
} from "./geminiService";
import { GeminiService } from "./geminiService";

export const RECOMMENDED_MODELS = [
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-haiku'
];

export class OpenRouterService implements AIProvider {
  private gemini: GeminiService;

  constructor() {
    this.gemini = new GeminiService();
  }

  async callPhase(
    phase: 'planning' | 'coding' | 'review' | 'security' | 'performance' | 'uiux',
    input: string,
    modelName: string = 'openai/gpt-4o',
    retries: number = 3
  ): Promise<any> {
    let systemInstruction = '';
    switch (phase) {
      case 'planning': 
        systemInstruction = `${BASE_ROLE}\n\n${DEEP_THINKING}\n\n${FIRST_COMMAND_COMPLETION}\n\n${STRICT_SCOPE_EDITING}\n\n${DEPENDENCY_GRAPH}\n\n${MANDATORY_RULES}\n\n${PLANNING_PROMPT}\n\n${RESPONSE_FORMAT}`; 
        break;
      case 'coding': 
        systemInstruction = `${BASE_ROLE}\n\n${DEEP_THINKING}\n\n${FIRST_COMMAND_COMPLETION}\n\n${STRICT_SCOPE_EDITING}\n\n${UNIT_TESTING}\n\n${DEPENDENCY_GRAPH}\n\n${SURGICAL_EDITING}\n\n${PATCH_MODE_RULE}\n\n${MANDATORY_RULES}\n\n${DESIGN_SYSTEM}\n\n${CODING_PROMPT}\n\n${RESPONSE_FORMAT}`; 
        break;
      case 'review': 
        systemInstruction = `${BASE_ROLE}\n\n${STRICT_SCOPE_EDITING}\n\n${SURGICAL_EDITING}\n\n${PATCH_MODE_RULE}\n\n${REVIEW_PROMPT}\n\n${RESPONSE_FORMAT}`; 
        break;
      case 'security': 
        systemInstruction = `${BASE_ROLE}\n\n${STRICT_SCOPE_EDITING}\n\n${SURGICAL_EDITING}\n\n${PATCH_MODE_RULE}\n\n${OPTIMIZATION_PROMPT}\n\n${RESPONSE_FORMAT}`; 
        break;
      case 'performance': 
        systemInstruction = `${BASE_ROLE}\n\n${STRICT_SCOPE_EDITING}\n\n${SURGICAL_EDITING}\n\n${PATCH_MODE_RULE}\n\n${PERFORMANCE_PROMPT}\n\n${RESPONSE_FORMAT}`; 
        break;
      case 'uiux': 
        systemInstruction = `${BASE_ROLE}\n\n${STRICT_SCOPE_EDITING}\n\n${DESIGN_SYSTEM}\n\n${SURGICAL_EDITING}\n\n${PATCH_MODE_RULE}\n\n${UI_UX_PROMPT}\n\n${RESPONSE_FORMAT}`; 
        break;
    }

    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("OPENROUTER_API_KEY not found.");

    let lastError;
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${key}`,
            "Content-Type": "application/json",
            "HTTP-Referer": window.location.origin,
            "X-Title": "OneClick Studio"
          },
          body: JSON.stringify({
            model: modelName,
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: input }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
          })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error?.message || `OpenRouter error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        return this.gemini.parseModelJson(content || '{}');
      } catch (error: any) {
        Logger.warn(`OpenRouter Attempt ${attempt} failed`, { component: 'OpenRouterService', model: modelName, attempt }, error);
        lastError = error;
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    throw new Error(`OpenRouter API failed after ${retries} attempts: ${lastError?.message}`);
  }
}
