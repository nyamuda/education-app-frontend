import type { Curriculum } from "./curriculum";
import type { Level } from "./level";

export class ExamBoard {
  public constructor(
    public id: number,
    public name: string,
    public curriculumId: number,
    public curriculum: Curriculum | null,
    public levels: Level[] = [],
    public createdAt: Date = new Date(),
  ) {}
}
