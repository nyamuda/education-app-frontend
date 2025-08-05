import type { Question } from "./question";

export class Tag {
  public constructor(
    public id: number,
    public name: string,
    public questions: Question[] = [],
  ) {}
}
