export interface TopicUploadFormData {
  name: string;
  curriculumId: number | null;
  examBoardId: number | null;
  levelId: number | null;
  subjectId: number | null;
  file: File | null;
}
