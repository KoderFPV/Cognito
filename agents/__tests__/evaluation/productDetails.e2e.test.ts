import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  evaluateConversation,
  defaultProductDetailsCriteria,
  IEvaluationResult,
  IConversationTurn,
} from './evaluator';
import { runConversation, IConversationScenario } from './conversationRunner';
import { clearLastRunDirectory, saveFailedTest } from './testResultsReporter';
import { setupTestProducts, teardownTestProducts } from './testFixtures';

const MINIMUM_PASSING_SCORE = 3.5;

beforeAll(async () => {
  clearLastRunDirectory();
  await setupTestProducts();
}, 60000);

afterAll(async () => {
  await teardownTestProducts();
}, 30000);

const productDetailsScenarios: IConversationScenario[] = [
  {
    name: 'Product details by position',
    locale: 'en',
    turns: [
      { userMessage: 'Show me laptops' },
      { userMessage: 'What are the specs of the first one?' },
    ],
    expectedBehavior:
      'After showing laptops, the assistant should provide detailed specifications of the first laptop including RAM, processor, storage from attributes or description.',
  },
  {
    name: 'Product details by name',
    locale: 'en',
    turns: [{ userMessage: 'Tell me about Gaming Laptop Pro X1' }],
    expectedBehavior:
      'The assistant should provide detailed information about the Gaming Laptop Pro X1 including specifications like RAM, GPU, and storage.',
  },
  {
    name: 'Product details in Polish',
    locale: 'pl',
    turns: [
      { userMessage: 'Pokaż laptopy' },
      { userMessage: 'Jaki procesor ma pierwszy?' },
    ],
    expectedBehavior:
      'The assistant should provide processor details of the first laptop in Polish language.',
  },
  {
    name: 'Non-existent product',
    locale: 'en',
    turns: [{ userMessage: 'Tell me about SuperPhone 3000' }],
    expectedBehavior:
      'The assistant should indicate that the product was not found or ask for more information.',
  },
  {
    name: 'Product details by partial name',
    locale: 'en',
    turns: [{ userMessage: 'What specs does the iPhone have?' }],
    expectedBehavior:
      'The assistant should provide details about the iPhone 15 Pro Max including processor and storage.',
  },
];

describe('Product Details E2E Evaluation', () => {
  describe.each(productDetailsScenarios)('Scenario: $name', (scenario) => {
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
        defaultProductDetailsCriteria,
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
      expect(evaluationResult.passed).toBe(true);
    });

    it('should have valid reasoning', () => {
      expect(evaluationResult.reasoning).toBeTruthy();
      expect(evaluationResult.reasoning.length).toBeGreaterThan(10);
    });
  });
});

const MULTI_TURN_COMPLEX_MIN_SCORE = 3.0;

const multiTurnDetailsScenarios: Array<{
  scenario: IConversationScenario;
  minScore: number;
}> = [
  {
    scenario: {
      name: 'Search then ask for multiple products',
      locale: 'en',
      turns: [
        { userMessage: 'Show me smartphones' },
        { userMessage: 'Tell me more about the first one' },
        { userMessage: 'What about the second one?' },
      ],
      expectedBehavior:
        'The assistant should show smartphones first, then provide details for the first smartphone, then provide details for the second smartphone. Each product should have specifications.',
    },
    minScore: MULTI_TURN_COMPLEX_MIN_SCORE,
  },
  {
    scenario: {
      name: 'Search then compare',
      locale: 'en',
      turns: [
        { userMessage: 'I need a laptop' },
        { userMessage: 'How much RAM does the first one have?' },
      ],
      expectedBehavior:
        'The assistant should first show laptops, then provide the RAM specification for the first laptop when asked.',
    },
    minScore: MINIMUM_PASSING_SCORE,
  },
];

describe('Multi-Turn Product Details E2E Evaluation', () => {
  describe.each(multiTurnDetailsScenarios)('Scenario: $scenario.name', ({ scenario, minScore }) => {
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
        defaultProductDetailsCriteria,
        scenario.expectedBehavior
      );

      console.log(`\nEvaluation Score: ${evaluationResult.score}`);
      console.log(`Reasoning: ${evaluationResult.reasoning}\n`);

      if (evaluationResult.score < minScore) {
        saveFailedTest(scenario, conversation, evaluationResult);
      }
    }, 240000);

    it(`should pass LLM evaluation with score >= ${minScore}`, () => {
      expect(evaluationResult.score).toBeGreaterThanOrEqual(minScore);
    });

    it('should have valid reasoning', () => {
      expect(evaluationResult.reasoning).toBeTruthy();
      expect(evaluationResult.reasoning.length).toBeGreaterThan(10);
    });
  });
});
