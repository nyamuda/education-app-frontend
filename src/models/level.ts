import type { ExamBoard } from "./examBoard";
import type { Question } from "./question";
import type { Subject } from "./subject";

export class Level {
  public constructor(
    public id: number,
    public name: string,
    public examBoardId: number,
    public examBoard: ExamBoard | null,
    public subjects: Subject[] = [],
    public questions: Question[] = [],
    public createdAt: Date = new Date(),
  ) {}
}
