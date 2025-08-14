import type { FlagStatus } from "@/enums/flags/flagStatus";
import type { User } from "@/interfaces/auth/user";
import { BaseFlag } from "./baseFlag";
import type { AnswerFlagType } from "@/enums/flags/answerFlagType";
import type { Answer } from "../answer";

/**
 * Represents a report or flag raised by a user on an answer.
 */
export class AnswerFlag extends BaseFlag {
  public constructor(
    // BaseFlag properties
    id: number,
    content: string | null,
    userId: number,
    user: User | null,
    status: FlagStatus,
    createdAt: Date = new Date(),

    // AnswerFlag properties
    public answerId: number,
    public answer: Answer | null,
    public flagType: AnswerFlagType,
  ) {
    super(id, content, userId, user, status, createdAt);
  }
}
