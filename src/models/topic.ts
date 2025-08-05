import type { Subject } from "./subject";

export class Topic {
  public constructor(
    public id: number,
    public name: string,
    public subjects: Subject[],
    public createdAt: Date,
  ) {}
}
