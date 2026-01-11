import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { createOllamaClient } from '@/services/llm/llm.service';

const EVALUATOR_TEMPERATURE = 0.1;
const EVALUATOR_MAX_TOKENS = 500;

export interface IEvaluationResult {
  score: number;
  reasoning: string;
  passed: boolean;
}

export interface IConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface IEvaluationCriteria {
  name: string;
  description: string;
  weight: number;
}

const createEvaluationPrompt = (
  criteria: IEvaluationCriteria[],
  expectedBehavior: string
) => {
  const criteriaList = criteria
    .map((c, i) => `${i + 1}. ${c.name} (weight: ${c.weight}): ${c.description}`)
    .join('\n');

  return `You are an AI evaluator. Your task is to evaluate a conversation between a user and an e-commerce shopping assistant.

EVALUATION CRITERIA:
${criteriaList}

EXPECTED BEHAVIOR:
${expectedBehavior}

SCORING INSTRUCTIONS:
- Score each criterion from 1 to 5:
  1 = Very poor, completely fails the criterion
  2 = Poor, mostly fails with minor success
  3 = Acceptable, meets basic expectations
  4 = Good, exceeds expectations in some areas
  5 = Excellent, fully meets or exceeds all expectations

- Calculate weighted average score
- Response MUST be in this exact JSON format:
{
  "scores": [
    {"criterion": "criterion_name", "score": X, "reason": "brief explanation"}
  ],
  "overall_score": X.X,
  "reasoning": "overall assessment",
  "passed": true/false
}`;
};

const formatConversationForEvaluation = (conversation: IConversationTurn[]) => {
  return conversation
    .map((turn) => `${turn.role.toUpperCase()}: ${turn.content}`)
    .join('\n\n');
};

const parseEvaluationResponse = (response: string): IEvaluationResult => {
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      score: 1,
      reasoning: 'Failed to parse evaluation response',
      passed: false,
    };
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      score: parsed.overall_score,
      reasoning: parsed.reasoning,
      passed: parsed.passed,
    };
  } catch {
    const scoreMatch = response.match(/overall_score["\s:]+(\d+\.?\d*)/);
    const reasoningMatch = response.match(/reasoning["\s:]+["']([^"']+)["']/);
    const passedMatch = response.match(/passed["\s:]+(\w+)/);

    const score = scoreMatch ? parseFloat(scoreMatch[1]) : 1;
    const reasoning = reasoningMatch ? reasoningMatch[1] : 'Failed to parse reasoning';
    const passed = passedMatch ? passedMatch[1] === 'true' : false;

    return { score, reasoning, passed };
  }
};

export const evaluateConversation = async (
  conversation: IConversationTurn[],
  criteria: IEvaluationCriteria[],
  expectedBehavior: string
): Promise<IEvaluationResult> => {
  const llm = createOllamaClient(EVALUATOR_TEMPERATURE, EVALUATOR_MAX_TOKENS);

  const systemPrompt = createEvaluationPrompt(criteria, expectedBehavior);
  const conversationText = formatConversationForEvaluation(conversation);

  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`CONVERSATION TO EVALUATE:\n\n${conversationText}`),
  ]);

  const content = response.content.toString();

  return parseEvaluationResponse(content);
};

export const defaultProductSearchCriteria: IEvaluationCriteria[] = [
  {
    name: 'Relevance',
    description: 'Does the assistant return products relevant to the user query?',
    weight: 3,
  },
  {
    name: 'Completeness',
    description: 'Does the response include necessary product details (name, price, category)?',
    weight: 2,
  },
  {
    name: 'Helpfulness',
    description: 'Is the assistant helpful in guiding the user to find products?',
    weight: 2,
  },
  {
    name: 'Accuracy',
    description: 'Are the product details accurate and properly formatted?',
    weight: 2,
  },
  {
    name: 'Natural Language',
    description: 'Is the response natural and easy to understand?',
    weight: 1,
  },
];

export const defaultChatCriteria: IEvaluationCriteria[] = [
  {
    name: 'Appropriateness',
    description: 'Is the response appropriate for the user message?',
    weight: 3,
  },
  {
    name: 'Helpfulness',
    description: 'Does the assistant provide helpful information or guidance?',
    weight: 2,
  },
  {
    name: 'Coherence',
    description: 'Is the response coherent and logically structured?',
    weight: 2,
  },
  {
    name: 'Tone',
    description: 'Is the tone friendly and professional?',
    weight: 1,
  },
];
