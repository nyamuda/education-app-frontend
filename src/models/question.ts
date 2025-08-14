import type { User } from "@/interfaces/auth/user";
import type { ExamBoard } from "./examBoard";
import type { Subject } from "./subject";
import type { Subtopic } from "./subtopic";
import type { Topic } from "./topic";
import type { Tag } from "./Tag";
import type { Upvote } from "./upvote";
import type { QuestionFlag } from "./flags/questionFlag";
import type { Answer } from "./answer";

export class Question {
  public constructor(
    public id: number,
    public content: string,
    public marks: number | null,

    public examBoardId: number,
    public examBoard: ExamBoard | null,

    public subjectId: number,
    public subject: Subject | null,

    public topicId: number,
    public topic: Topic | null,

    public subtopics: Subtopic[] = [],

    public userId: number,
    public user: User | null,

    public tags: Tag[] = [],
    public upvotes: Upvote[] = [],
    public flags: QuestionFlag[] = [],
    public comments: Comment[] = [],
    public answers: Answer[] = [],

    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
