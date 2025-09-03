import type { QuestionStatus } from "@/enums/questions/questionStatus";
import type { QuestionFormData } from "@/interfaces/questions/questionFormData";
import type { QuestionSubmission } from "@/interfaces/questions/questionSubmission";

export class QuestionHelper {
  /**
   * Prepares and returns the question submission data.
   *
   * @returns The prepared question data.
   */
  prepareQuestionSubmission = (formData: QuestionFormData): QuestionSubmission | null => {
    const {
      title,
      questionText,
      answerText,
      answerHtml,
      marks,
      subjectId,
      topicId,
      subtopicId,
      tags,
    } = formData;

    // Build the QuestionSubmission object
    const submissionData: QuestionSubmission = {
      title,
      questionText,
      answerHtml,
      answerText,
      marks,
      subjectId,
      topicId,
      subtopicId,
      tags,
      status: status ? status : question.value.status,
    };

    return submissionData;
  };
}
