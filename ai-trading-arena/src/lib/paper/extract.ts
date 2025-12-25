/**
 * Paper Strategy Extraction
 * Uses Claude to extract trading strategies from research papers
 */

import { sendMessage, type ClaudeModel } from "@/lib/claude/client";

export interface ExtractedStrategy {
  name: string;
  description: string;
  strategy_prompt: string;
  key_indicators: string[];
  risk_level: "Low" | "Medium" | "High";
  suggested_tickers: string[];
  paper_summary: string;
}

const STRATEGY_EXTRACTION_PROMPT = `You are an expert financial analyst specializing in extracting actionable trading strategies from academic research papers and financial reports.

Your task is to analyze the provided research paper text and extract a practical trading strategy that can be implemented by an AI trading agent.

## Instructions:
1. Identify the core trading hypothesis or strategy presented in the paper
2. Extract specific entry/exit signals and conditions
3. Identify key technical or fundamental indicators mentioned
4. Note any risk management recommendations
5. Identify the types of securities or markets the strategy applies to

## Response Format:
Respond ONLY with valid JSON in exactly this format:
\`\`\`json
{
  "name": "Short descriptive name for the strategy (max 50 chars)",
  "description": "Brief 1-2 sentence summary of the strategy",
  "strategy_prompt": "A detailed trading agent system prompt (300-500 words) that implements this strategy. Include specific rules for entry, exit, position sizing, and risk management based on the paper's findings.",
  "key_indicators": ["List", "of", "key", "technical/fundamental", "indicators"],
  "risk_level": "Low" | "Medium" | "High",
  "suggested_tickers": ["Up to 5 relevant stock tickers this strategy might apply to"],
  "paper_summary": "2-3 sentence summary of the paper's main findings"
}
\`\`\`

## Important:
- Make the strategy_prompt actionable and specific
- Include clear rules the AI can follow
- If the paper doesn't describe a clear strategy, infer one from its findings
- Focus on practical implementation, not academic theory`;

/**
 * Extract trading strategy from paper text using Claude
 */
export async function extractStrategyFromPaper(
  paperText: string,
  model: ClaudeModel = "claude-sonnet"
): Promise<{ strategy: ExtractedStrategy; cost: number }> {
  // Truncate paper text if too long (keep under ~100k chars for token limits)
  const maxLength = 100000;
  const truncatedText = paperText.length > maxLength
    ? paperText.slice(0, maxLength) + "\n\n[... paper truncated for length ...]"
    : paperText;

  const userMessage = `## Research Paper Content:

${truncatedText}

---

Please analyze this research paper and extract a practical trading strategy following the format specified.`;

  const response = await sendMessage(
    STRATEGY_EXTRACTION_PROMPT,
    [{ role: "user", content: userMessage }],
    model,
    2000
  );

  // Parse the response
  const strategy = parseStrategyResponse(response.content);

  if (!strategy) {
    throw new Error("Failed to extract strategy from paper. Please try a different paper.");
  }

  return {
    strategy,
    cost: response.cost,
  };
}

/**
 * Parse Claude's strategy extraction response
 */
function parseStrategyResponse(response: string): ExtractedStrategy | null {
  try {
    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
    const jsonStr = jsonMatch ? jsonMatch[1] : response;

    const parsed = JSON.parse(jsonStr.trim());

    // Validate required fields
    if (!parsed.name || !parsed.strategy_prompt) {
      console.error("Missing required fields in strategy response");
      return null;
    }

    return {
      name: parsed.name?.slice(0, 50) || "Extracted Strategy",
      description: parsed.description || "",
      strategy_prompt: parsed.strategy_prompt || "",
      key_indicators: Array.isArray(parsed.key_indicators) ? parsed.key_indicators : [],
      risk_level: ["Low", "Medium", "High"].includes(parsed.risk_level)
        ? parsed.risk_level
        : "Medium",
      suggested_tickers: Array.isArray(parsed.suggested_tickers)
        ? parsed.suggested_tickers.slice(0, 5)
        : [],
      paper_summary: parsed.paper_summary || "",
    };
  } catch (err) {
    console.error("Failed to parse strategy response:", err);
    console.error("Raw response:", response);
    return null;
  }
}
