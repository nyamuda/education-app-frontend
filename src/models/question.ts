import type { User } from "@/user";
import type { ExamBoard } from "./examBoard";
import type { Subject } from "./subject";
import type { Subtopic } from "./subtopic";
import type { Topic } from "./topic";

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
