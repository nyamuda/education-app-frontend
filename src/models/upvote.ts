import type { User } from "@/user";
import type { Question } from "./question";

export class Upvote {
  public constructor(
    public id: number,

    public userId: number,
    public user: User | null,

    public questionId: number | null,
    public question: Question | null,

    public answerId: number | null,
    public answer: Answer | null,

    public commentId: number | null,
    public comment: Comment | null,

    public createdAt: Date = new Date(),
  ) {}
}
