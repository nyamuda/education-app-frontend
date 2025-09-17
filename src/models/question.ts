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
    public contentText: string = "",
    public contentHtml: string = "",
    public marks: number | null = null,

    public authorAnswer: Answer | null = null,

    public examBoardId: number | null = null,
    public examBoard: ExamBoard | null = null,

    public subjectId: number | null = null,
    public subject: Subject | null = null,

    public topicId: number | null = null,
    public topic: Topic | null = null,

    public subtopicId: number | null = null,
    public subtopic: Subtopic | null = null,

    public userId: number | null = null,
    public user: User | null = null,

    public status: QuestionStatus = QuestionStatus.Draft,

    public tags: Tag[] = [],
    public upvotes: Upvote[] = [],
    public totalUpvotes: number | null = null,
    public totalAnswers: number | null = null,
    public flags: QuestionFlag[] = [],
    public comments: Comment[] = [],
    public answers: Answer[] = [],

    /**Indicates whether the current user has bookmarked this question. */
    public isBookmarked: boolean = false,

    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
