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

  /**
   * Converts a `Question` object (from the backend) into `QuestionFormData`.
   * This is used to populate the form when editing an existing question.
   *
   * @param question The backend-provided `Question` object.
   * @returns A `QuestionFormData` object for use in the form.
   */
  public static prepareQuestionForm = (question: Question): QuestionFormData => {
    const {
      title,
      questionText,
      answerHtml,
      answerText,
      marks,
      subjectId,
      topicId,
      subtopicId,
      tags,
    } = question;

    const formData: QuestionFormData = {
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

    return formData;
  };
}
