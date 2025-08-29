import type { Tag } from "@/models/Tag";

export interface QuestionFormData {
  title: string | null;
  question: string | null;
  answerHtml: string | null | undefined;
  answerText: string | null | undefined;
  curriculumId: number | null;
  examBoardId: number | null;
  levelId: number | null;
  subjectId: number | null;
  topicId: number | null;
  subtopicId: number | null;
  tags: Tag[];
  marks: number | null;
}
