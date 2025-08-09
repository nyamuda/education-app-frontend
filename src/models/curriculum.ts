import type { ExamBoard } from "./examBoard";

export class Curriculum {
  public constructor(
    public id: number,
    public name: string,
    public examBoards: ExamBoard[],
    public createdAt: Date = new Date(),
  ) {}
}
