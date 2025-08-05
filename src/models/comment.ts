import type { User } from "@/user";
import type { Question } from "./question";
import type { Answer } from "./answer";
import type { CommentFlag } from "./flags/commentFlag";
import type { Upvote } from "./upvote";

export class Comment {
  public constructor(
    public id: number,
    public content: string,
    public userId: number,
    public user: User | null,

    // If this comment is on a question, the ID of the related question.
    public questionId: number | null,
    public question: Question | null,

    //  If this comment is on an answer, the ID of the related answer.
    public answerId: number | null,
    public answer: Answer | null,

    public flags: CommentFlag[] = [],
    public upvotes: Upvote[] = [],

    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
