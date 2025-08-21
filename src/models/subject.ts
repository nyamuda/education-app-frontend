import type { Level } from "./level";
import type { Question } from "./question";
import type { Topic } from "./topic";

export class Subject {
  public constructor(
    public id: number,
    public name: string,
    public levelId: number,
    public level: Level | null = null,
    public topics: Topic[] = [],
    public questions: Question[] = [],
    public createdAt: Date = new Date(),
  ) {}
}
