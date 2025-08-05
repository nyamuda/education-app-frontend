export class Curriculum {
  public constructor(
    public id: number,
    public name: string,
    public createdAt: Date = new Date(),
  ) {}
}
