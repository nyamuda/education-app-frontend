import type { TopicSortOption } from "@/enums/topics/topicSortOption";

export interface TopicQueryParams {
  page: number;
  pageSize: number;
  sortBy: TopicSortOption;
  curriculumId: number | null;
  examBoardId: number | null;
  levelId: number | null;
  subjectId: number | null;
}
