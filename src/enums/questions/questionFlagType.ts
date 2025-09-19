/**
 * Flags for inappropriate or low-quality questions.
 */
export enum QuestionFlagType {
  /**
   * The question is spam, such as promotional or irrelevant links.
   */
  Spam = "Spam",

  /**
   * The question contains offensive, abusive, or inappropriate content.
   */
  Offensive = "Offensive",

  /**
   * The question is not relevant to the topic or subject.
   */
  Irrelevant = "Irrelevant",

  /**
   * The question violates rules but doesn't fit other categories.
   */
  Other = "Other",
}
