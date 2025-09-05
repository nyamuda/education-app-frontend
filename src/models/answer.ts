import type { User } from "@/interfaces/auth/user";
import type { Question } from "./question";
import type { Upvote } from "./upvote";
import type { AnswerFlag } from "./flags/answerFlag";
import type { Comment } from "./comment";

export class Answer {
  public constructor(
    public id: number,

    public contentText: string,
    public contentHtml: string,

    public questionId: number,
    public question: Question | null,

    public userId: number,
    public user: User | null,

    public upvotes: Upvote[] = [],
    public comments: Comment[] = [],
    public flags: AnswerFlag[] = [],

    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
