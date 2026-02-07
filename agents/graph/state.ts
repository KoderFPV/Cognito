import { Annotation } from '@langchain/langgraph';
import { BaseMessage } from '@langchain/core/messages';
import { IProduct } from '@/domain/product';

export interface ISearchResult {
  products: IProduct[];
  query: string;
  timestamp: Date;
}

export const GraphState = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => [...current, ...update],
  }),
  locale: Annotation<string>(),
  currentAgent: Annotation<string>(),
  response: Annotation<string>(),
  lastSearchResults: Annotation<ISearchResult | null>(),
});

export type IGraphState = typeof GraphState.State;
