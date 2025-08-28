import type { User } from "@/interfaces/auth/user";
import type { ExamBoard } from "./examBoard";
import type { Subject } from "./subject";
import type { Subtopic } from "./subtopic";
import type { Topic } from "./topic";
import type { Tag } from "./Tag";
import type { Upvote } from "./upvote";
import type { QuestionFlag } from "./flags/questionFlag";
import type { Answer } from "./answer";
import { QuestionStatus } from "@/enums/questions/questionStatus";

export class Question {
  public constructor(
    public id: number = 0,
    public title: string = "",
    public content: string = "",
    public marks: number | null = 0,

    public examBoardId: number | null = null,
    public examBoard: ExamBoard | null = null,

    public subjectId: number | null = null,
    public subject: Subject | null = null,

    public topicId: number | null = null,
    public topic: Topic | null = null,

    public subtopics: Subtopic[] = [],

    public userId: number | null = null,
    public user: User | null = null,

    public questionStatus: QuestionStatus = QuestionStatus.Draft,

    public tags: Tag[] = [],
    public upvotes: Upvote[] = [],
    public flags: QuestionFlag[] = [],
    public comments: Comment[] = [],
    public answers: Answer[] = [],

    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
