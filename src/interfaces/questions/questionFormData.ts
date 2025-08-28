export interface QuestionFormData {
  title: string | null;
  question: string | null;
  answer: string | null;
  curriculumId: number | null;
  examBoardId: number | null;
  levelId: number | null;
  subjectId: number | null;
  topicId: number | null;
  subtopicId: number | null;
  tags: string[];
}
