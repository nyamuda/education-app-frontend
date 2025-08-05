import type { ExamBoard } from "./examBoard";
import type { Question } from "./question";
import type { Topic } from "./topic";

export class Subject {
  public constructor(
    public id: number,
    public name: string,
    public examBoards: ExamBoard[] = [],
    public topics: Topic[] = [],
    public questions: Question[] = [],
    public createdAt: Date = new Date(),
  ) {}
}
