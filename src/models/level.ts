import type { ExamBoard } from "./examBoard";

export class Level {
  public constructor(
    public id: number,
    public name: string,
    public examBoardId: number,
    public examBoard: ExamBoard | null,
    public createdAt: Date = new Date(),
  ) {}
}
