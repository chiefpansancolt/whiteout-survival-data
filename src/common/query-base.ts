/** Filter methods of a subclass return a new query and do not change the current query. */
export abstract class QueryBase<T extends { id: string; name: string }> {
  constructor(protected readonly data: T[]) {}

  get(): T[] {
    return this.data;
  }

  first(): T | undefined {
    return this.data[0];
  }

  find(id: string): T | undefined {
    return this.data.find((x) => x.id === id);
  }

  /** Matches the full `name` and ignores case. */
  findByName(name: string): T | undefined {
    const q = name.toLowerCase();
    return this.data.find((x) => x.name.toLowerCase() === q);
  }

  /** Matches a part of the `name` and ignores case. */
  search(query: string): T[] {
    const q = query.toLowerCase();
    return this.data.filter((x) => x.name.toLowerCase().includes(q));
  }

  count(): number {
    return this.data.length;
  }
}
