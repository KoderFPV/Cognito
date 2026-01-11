import { executeChatGraphWithStream, IStreamCallback } from '@/agents/graph/chatGraph';
import { IConversationTurn } from './evaluator';

export interface IConversationScenario {
  name: string;
  locale: string;
  turns: Array<{
    userMessage: string;
    validateResponse?: (response: string) => boolean;
  }>;
  expectedBehavior: string;
}

export interface IConversationResult {
  scenario: IConversationScenario;
  conversation: IConversationTurn[];
  success: boolean;
  error?: string;
}

const createNoopCallbacks = (): IStreamCallback => ({
  onToken: () => {},
  onComplete: () => {},
  onError: () => {},
});

export const runConversation = async (
  scenario: IConversationScenario
): Promise<IConversationResult> => {
  const conversation: IConversationTurn[] = [];
  const sessionId = `eval-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const callbacks = createNoopCallbacks();

  const messages: Array<{ role: string; content: string }> = [];

  for (const turn of scenario.turns) {
    messages.push({ role: 'user', content: turn.userMessage });
    conversation.push({ role: 'user', content: turn.userMessage });

    const response = await executeChatGraphWithStream(
      sessionId,
      scenario.locale,
      messages,
      callbacks
    );

    messages.push({ role: 'assistant', content: response });
    conversation.push({ role: 'assistant', content: response });

    if (turn.validateResponse && !turn.validateResponse(response)) {
      return {
        scenario,
        conversation,
        success: false,
        error: `Response validation failed for turn: "${turn.userMessage}"`,
      };
    }
  }

  return {
    scenario,
    conversation,
    success: true,
  };
};

export const runMultipleConversations = async (
  scenarios: IConversationScenario[]
): Promise<IConversationResult[]> => {
  const results: IConversationResult[] = [];

  for (const scenario of scenarios) {
    const result = await runConversation(scenario);
    results.push(result);
  }

  return results;
};
