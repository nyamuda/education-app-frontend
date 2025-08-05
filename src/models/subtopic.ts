import type { Question } from "./question";
import type { Topic } from "./topic";

export class Subtopic {
  public constructor(
    public id: number,
    public name: string,
    public topicId: number,
    public Topic: Topic | null,
    public questions: Question[],
    public createdAt: Date = new Date(),
  ) {}
}
