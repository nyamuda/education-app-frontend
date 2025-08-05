import type { Topic } from "./topic";

export class Subtopic {
  public constructor(
    public id: number,
    public name: string,
    public topicId: number,
    public Topic: Topic,
    public createdAt: Date,
  ) {}
}
