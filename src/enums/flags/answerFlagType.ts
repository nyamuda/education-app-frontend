/**
 * Flags for inappropriate or low-quality answers.
 */
export enum AnswerFlagType {
  /**
   * The answer is spam, such as promotional or irrelevant links.
   */
  Spam = "Spam",

  /**
   * The answer contains offensive, abusive, or inappropriate content.
   */
  Offensive = "Offensive",

  /**
   * The answer is a duplicate of another existing answer.
   */
  Duplicate = "Duplicate",

  /**
   * The answer is not relevant to the topic or question.
   */
  Irrelevant = "Irrelevant",

  /**
   * The answer violates rules but doesn't fit other categories.
   */
  Other = "Other",
}
