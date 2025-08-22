import type { SubjectSortOption } from "@/enums/subjects/subjectSortOption";

export interface SubjectQueryParams {
  page: number;
  pageSize: number;
  sortBy: SubjectSortOption;
  curriculumId: number | null;
  examBoardId: number | null;
  levelId: number | null;
}
