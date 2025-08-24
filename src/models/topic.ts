import type { Question } from "./question";
import type { Subject } from "./subject";
import type { Subtopic } from "./subtopic";

export class Topic {
  public constructor(
    public id: number,
    public name: string,
    public subjectId: number,
    public subject: Subject | null,
    public subtopics: Subtopic[],
    public questions: Question[],
    public createdAt: Date = new Date(),
  ) {}
}
