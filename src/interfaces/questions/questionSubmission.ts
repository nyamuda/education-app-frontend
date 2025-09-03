import type { QuestionStatus } from "@/enums/questions/questionStatus";

export interface QuestionSubmission {
  title: string | null;
  questionText: string | null | undefined;
  answerHtml: string | null | undefined;
  answerText: string | null | undefined;
  subjectId: number | null;
  topicId: number | null;
  subtopicId: number | null;
  tags: string[];
  marks: number | null;
}
