import fs from 'fs';
import path from 'path';
import { IConversationTurn, IEvaluationResult } from './evaluator';
import { IConversationScenario } from './conversationRunner';

const LAST_RUN_DIR = path.join(__dirname, 'last-run');

export interface ITestResult {
  scenario: IConversationScenario;
  conversation: IConversationTurn[];
  evaluation: IEvaluationResult;
}

const ensureDirectoryExists = (dirPath: string) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const sanitizeFilename = (name: string) => {
  return name.replace(/[^a-zA-Z0-9-_]/g, '_').toLowerCase();
};

export const clearLastRunDirectory = () => {
  if (fs.existsSync(LAST_RUN_DIR)) {
    const files = fs.readdirSync(LAST_RUN_DIR);
    for (const file of files) {
      fs.unlinkSync(path.join(LAST_RUN_DIR, file));
    }
  }
  ensureDirectoryExists(LAST_RUN_DIR);
};

export const saveFailedTest = (
  scenario: IConversationScenario,
  conversation: IConversationTurn[],
  evaluation: IEvaluationResult
) => {
  ensureDirectoryExists(LAST_RUN_DIR);

  const filename = `${sanitizeFilename(scenario.name)}.json`;
  const filepath = path.join(LAST_RUN_DIR, filename);

  const output = {
    scenario: {
      name: scenario.name,
      locale: scenario.locale,
      expectedBehavior: scenario.expectedBehavior,
      turns: scenario.turns.map((t) => t.userMessage),
    },
    conversation,
    evaluation: {
      score: evaluation.score,
      passed: evaluation.passed,
      reasoning: evaluation.reasoning,
    },
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(filepath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`[FAILED] Saved to: ${filepath}`);
};
