import type { Tag } from "@/models/Tag";

export interface QuestionFormData {
  title: string | null;
  content: string | null;
  answerHtml: string | undefined;
  answerText: string | undefined;
  curriculumId: number | null;
  examBoardId: number | null;
  levelId: number | null;
  subjectId: number | null;
  topicId: number | null;
  subtopicId: number | null;
  tags: Tag[];
  marks: number | null;
}
