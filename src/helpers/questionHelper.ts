import type { QuestionFormData } from "@/interfaces/questions/questionFormData";
import type { QuestionSubmission } from "@/interfaces/questions/questionSubmission";

export class QuestionHelper {
  /**
   * Prepares question data for submission to the the backend. This ensures all required
   * properties (title, content, marks, subject, topic, subtopic, tags)
   * are included in the correct structure before submitting the question to the backend.
   *
   * @param formData The user-provided form data.
   * @returns The structured `QuestionSubmission` object.
   */
  public static prepareQuestionSubmission = (formData: QuestionFormData): QuestionSubmission => {
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
    };

    return submissionData;
  };
}
