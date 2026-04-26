import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

export const State = Annotation.Root({
  ...MessagesAnnotation.spec,

  iterations: Annotation<number>({
    reducer: (current, update) => update ?? current ?? 0,
    default: () => 0,
  }),

  finalAnswer: Annotation<string>({
    reducer: (_, update) => update ?? "",
    default: () => "",
  }),
});