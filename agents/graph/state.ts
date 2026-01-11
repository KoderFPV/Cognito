import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';

export const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => [...current, ...update],
  }),
  locale: Annotation<string>(),
  currentAgent: Annotation<string>(),
  response: Annotation<string>(),
});

export type IGraphState = typeof GraphState.State;
