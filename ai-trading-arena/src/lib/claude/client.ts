/**
 * Claude API Client
 * Uses fetch directly to call the Anthropic API
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

export type ClaudeModel = "claude-sonnet" | "claude-opus";

// Map our model names to Anthropic model IDs
const MODEL_MAP: Record<ClaudeModel, string> = {
  "claude-sonnet": "claude-sonnet-4-20250514",
  "claude-opus": "claude-opus-4-20250514",
};

// Approximate token costs (per 1K tokens)
const MODEL_COSTS: Record<ClaudeModel, { input: number; output: number }> = {
  "claude-sonnet": { input: 0.003, output: 0.015 },
  "claude-opus": { input: 0.015, output: 0.075 },
};

export interface ClaudeMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ClaudeResponse {
  content: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

interface AnthropicResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{ type: string; text?: string }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/**
 * Send a message to Claude and get a response
 */
export async function sendMessage(
  systemPrompt: string,
  messages: ClaudeMessage[],
  model: ClaudeModel = "claude-sonnet",
  maxTokens: number = 1024
): Promise<ClaudeResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY not set");
  }

  const modelId = MODEL_MAP[model];

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: modelId,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Anthropic API error:", response.status, errorText);
    throw new Error(`Anthropic API error: ${response.status}`);
  }

  const data: AnthropicResponse = await response.json();

  // Extract text content from response
  const textContent = data.content.find((c) => c.type === "text");
  const content = textContent?.text || "";

  // Calculate cost
  const inputTokens = data.usage.input_tokens;
  const outputTokens = data.usage.output_tokens;
  const costs = MODEL_COSTS[model];
  const cost = (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output;

  return {
    content,
    model: modelId,
    inputTokens,
    outputTokens,
    cost,
  };
}

/**
 * Analyze market news and make a trading decision
 */
export async function analyzeMarket(
  systemPrompt: string,
  newsData: string,
  portfolioContext: string,
  model: ClaudeModel = "claude-sonnet"
): Promise<ClaudeResponse> {
  const userMessage = `
## Current Portfolio
${portfolioContext}

## Recent Market News
${newsData}

Based on the above information, analyze the market conditions and provide your trading decision.
Respond in the following JSON format:

\`\`\`json
{
  "action": "BUY" | "SELL" | "HOLD",
  "ticker": "SYMBOL",
  "confidence": 0.0-1.0,
  "reasoning": "Your detailed analysis...",
  "news_summary": "Brief summary of relevant news...",
  "risk_assessment": "Low" | "Medium" | "High"
}
\`\`\`
`;

  return sendMessage(systemPrompt, [{ role: "user", content: userMessage }], model, 1500);
}
