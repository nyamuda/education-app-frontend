import type { AnswerSortOption } from "@/enums/answers/answerSortOption";

export interface AnswerQueryParams {
  page: number;
  pageSize: number;
  sortBy: AnswerSortOption;
  questionId: number | null;
}
