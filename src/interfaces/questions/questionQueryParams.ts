import type { QuestionSortOption } from "@/enums/questions/questionSortOption";

export interface QuestionQueryParams {
  page: number | null;
  pageSize: number | null;
  sortBy: QuestionSortOption | null;
  curriculumId: number | null;
  examBoardId: number | null;
  levelId: number | null;
  subjectId: number | null;
  topicId: number | null;
  subtopicId: number | null;
  search: string | null;
  tags: string | null;
}
