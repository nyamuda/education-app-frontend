import type { User } from "@/interfaces/auth/user";
import { BaseFlag } from "./baseFlag";
import type { FlagStatus } from "@/enums/flags/flagStatus";
import type { Question } from "../question";
import type { QuestionFlagType } from "@/enums/flags/questionFlagType";

/**
 * Represents a report or flag raised by a user on a question.
 */
export class QuestionFlag extends BaseFlag {
  public constructor(
    // BaseFlag properties
    id: number,
    content: string | null,
    userId: number,
    user: User | null,
    status: FlagStatus,
    createdAt: Date = new Date(),

    // QuestionFlag properties
    public questionId: number,
    public question: Question | null,
    public flagType: QuestionFlagType,
  ) {
    super(id, content, userId, user, status, createdAt);
  }
}
