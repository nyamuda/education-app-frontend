import type { SubtopicSortOption } from "@/enums/subtopics/subtopicSortOption";

export interface SubtopicQueryParams {
  page: number;
  pageSize: number;
  sortBy: SubtopicSortOption;
  curriculumId: number | null;
  examBoardId: number | null;
  levelId: number | null;
  subjectId: number | null;
  topicId: number | null;
}
