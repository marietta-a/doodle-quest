import { Difficulty } from "./Difficulty";
import { Language } from "./Language";

export interface AdventurePayload {
  pageContent: string,
  progressCallback: (progress: number) => void,
  language: Language,
  difficulty: Difficulty,
}