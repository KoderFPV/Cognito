import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  evaluateConversation,
  defaultProductSearchCriteria,
  defaultChatCriteria,
  IEvaluationResult,
  IConversationTurn,
} from './evaluator';
import { runConversation, IConversationScenario } from './conversationRunner';
import { clearLastRunDirectory, saveFailedTest } from './testResultsReporter';
import { setupTestProducts, teardownTestProducts } from './testFixtures';

const MINIMUM_PASSING_SCORE = 4.0;

beforeAll(async () => {
  clearLastRunDirectory();
  await setupTestProducts();
}, 60000);

afterAll(async () => {
  await teardownTestProducts();
}, 30000);

const productSearchScenarios: IConversationScenario[] = [
  {
    name: 'Simple laptop search',
    locale: 'en',
    turns: [{ userMessage: 'Show me laptops' }],
    expectedBehavior:
      'The assistant should return a list of products including laptops. Response should include product names and prices. Some non-laptop products may appear due to semantic search - this is acceptable.',
  },
  {
    name: 'Smartphone search',
    locale: 'en',
    turns: [{ userMessage: 'I want to buy a smartphone' }],
    expectedBehavior:
      'The assistant should return products including smartphones. Response should include product names and prices. Some related products may appear - this is acceptable.',
  },
  {
    name: 'Smartphone search in Polish',
    locale: 'pl',
    turns: [{ userMessage: 'Pokaż mi smartfony' }],
    expectedBehavior:
      'The assistant should return products including smartphones. Response should include product names and prices. The system should understand Polish language queries.',
  },
  {
    name: 'Gaming peripherals search',
    locale: 'en',
    turns: [{ userMessage: 'Show me gaming keyboards and gaming mice' }],
    expectedBehavior:
      'The assistant should return products related to gaming peripherals. Response should include product names and prices. Some related gaming products may appear - this is acceptable.',
  },
  {
    name: 'Audio equipment search',
    locale: 'en',
    turns: [{ userMessage: 'Show me headphones' }],
    expectedBehavior:
      'The assistant should return products including headphones or audio equipment. Response should include product names and prices.',
  },
];

const multiTurnScenarios: IConversationScenario[] = [
  {
    name: 'Multi-turn gaming setup',
    locale: 'en',
    turns: [
      { userMessage: 'I want something for gaming' },
      { userMessage: 'PC accessories like keyboard and mouse' },
    ],
    expectedBehavior:
      'The assistant should return products related to gaming or PC accessories. Response should include product names and prices.',
  },
];

describe('Product Search E2E Evaluation', () => {
  describe.each(productSearchScenarios)('Scenario: $name', (scenario) => {
    let evaluationResult: IEvaluationResult;
    let conversation: IConversationTurn[];

    beforeAll(async () => {
      const conversationResult = await runConversation(scenario);
      conversation = conversationResult.conversation;

      console.log(`\n=== Conversation: ${scenario.name} ===`);
      conversation.forEach((turn) => {
        console.log(`${turn.role.toUpperCase()}: ${turn.content}`);
      });

      expect(conversationResult.success).toBe(true);

      evaluationResult = await evaluateConversation(
        conversation,
        defaultProductSearchCriteria,
        scenario.expectedBehavior
      );

      console.log(`\nEvaluation Score: ${evaluationResult.score}`);
      console.log(`Reasoning: ${evaluationResult.reasoning}\n`);

      if (evaluationResult.score < MINIMUM_PASSING_SCORE) {
        saveFailedTest(scenario, conversation, evaluationResult);
      }
    }, 120000);

    it('should pass LLM evaluation with score >= 3.5', () => {
      expect(evaluationResult.score).toBeGreaterThanOrEqual(MINIMUM_PASSING_SCORE);
      expect(evaluationResult.passed).toBe(true);
    });

    it('should have valid reasoning', () => {
      expect(evaluationResult.reasoning).toBeTruthy();
      expect(evaluationResult.reasoning.length).toBeGreaterThan(10);
    });
  });
});

describe('Multi-Turn Conversation E2E Evaluation', () => {
  describe.each(multiTurnScenarios)('Scenario: $name', (scenario) => {
    let evaluationResult: IEvaluationResult;
    let conversation: IConversationTurn[];

    beforeAll(async () => {
      const conversationResult = await runConversation(scenario);
      conversation = conversationResult.conversation;

      console.log(`\n=== Multi-Turn: ${scenario.name} ===`);
      conversation.forEach((turn) => {
        console.log(`${turn.role.toUpperCase()}: ${turn.content}`);
      });

      expect(conversationResult.success).toBe(true);

      evaluationResult = await evaluateConversation(
        conversation,
        defaultProductSearchCriteria,
        scenario.expectedBehavior
      );

      console.log(`\nEvaluation Score: ${evaluationResult.score}`);
      console.log(`Reasoning: ${evaluationResult.reasoning}\n`);

      if (evaluationResult.score < MINIMUM_PASSING_SCORE) {
        saveFailedTest(scenario, conversation, evaluationResult);
      }
    }, 180000);

    it('should pass LLM evaluation with score >= 3.5', () => {
      expect(evaluationResult.score).toBeGreaterThanOrEqual(MINIMUM_PASSING_SCORE);
    });

    it('should have valid reasoning', () => {
      expect(evaluationResult.reasoning).toBeTruthy();
      expect(evaluationResult.reasoning.length).toBeGreaterThan(10);
    });
  });
});

describe('Edge Cases E2E Evaluation', () => {
  const edgeCaseScenarios: Array<{
    scenario: IConversationScenario;
    minScore: number;
  }> = [
    {
      scenario: {
        name: 'No product intent - greeting',
        locale: 'en',
        turns: [{ userMessage: 'Hello, how are you?' }],
        expectedBehavior:
          'The assistant should respond with a friendly greeting. Should NOT try to search for products since there is no product intent. A chat response is acceptable.',
      },
      minScore: MINIMUM_PASSING_SCORE,
    },
    {
      scenario: {
        name: 'Ambiguous query',
        locale: 'en',
        turns: [{ userMessage: 'I need something' }],
        expectedBehavior:
          'The assistant should either ask for clarification or indicate that it needs more information to search for products. Any reasonable response is acceptable.',
      },
      minScore: MINIMUM_PASSING_SCORE,
    },
  ];

  describe.each(edgeCaseScenarios)('Edge Case: $scenario.name', ({ scenario, minScore }) => {
    let evaluationResult: IEvaluationResult;
    let conversation: IConversationTurn[];

    beforeAll(async () => {
      const conversationResult = await runConversation(scenario);
      conversation = conversationResult.conversation;

      console.log(`\n=== Edge Case: ${scenario.name} ===`);
      conversation.forEach((turn) => {
        console.log(`${turn.role.toUpperCase()}: ${turn.content}`);
      });

      expect(conversationResult.success).toBe(true);

      evaluationResult = await evaluateConversation(
        conversation,
        defaultChatCriteria,
        scenario.expectedBehavior
      );

      console.log(`\nEvaluation Score: ${evaluationResult.score}`);
      console.log(`Reasoning: ${evaluationResult.reasoning}\n`);

      if (evaluationResult.score < minScore) {
        saveFailedTest(scenario, conversation, evaluationResult);
      }
    }, 120000);

    it('should handle edge case appropriately', () => {
      expect(evaluationResult.score).toBeGreaterThanOrEqual(minScore);
    });
  });
});
