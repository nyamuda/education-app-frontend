import type { Curriculum } from "./curriculum";
import type { Question } from "./question";
import type { Subject } from "./subject";

export class ExamBoard {
  public constructor(
    public id: number,
    public name: string,
    public curriculumId: number,
    public curriculum: Curriculum,
    public subjects: Subject[] = [],
    public questions: Question[] = [],
    public createdAt: Date = new Date(),
  ) {}
}
