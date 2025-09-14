export class PageInfo<T> {
  public constructor(
    public page: number = 1,
    public pageSize: number = 10,
    public hasMore: boolean = false,
    public totalItems: number = 0,
    public items: T[] = [],
  ) {}
}
