export class PageInfo<T> {
  public constructor(
    public page: number = 1,
    public pageSize: number = 2,
    public totalItems: number = 0,
    public items: T[] = [],
  ) {}
}
