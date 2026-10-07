/**
 * Base class of all query builders. A query holds an array of entries. Filter methods of a subclass
 * return a new query and do not change the array of the current query.
 */
export abstract class QueryBase<T extends { id: string; name: string }> {
  constructor(protected readonly data: T[]) {}

  /** Returns the entries of the query. The array is empty when no entry matches. */
  get(): T[] {
    return this.data;
  }

  /** Returns the first entry, or `undefined` when the query is empty. */
  first(): T | undefined {
    return this.data[0];
  }

  /** Returns the entry with this exact `id`, or `undefined` when no entry matches. The match is case-sensitive. */
  find(id: string): T | undefined {
    return this.data.find((x) => x.id === id);
  }

  /** Returns the first entry with this `name`, or `undefined` when no entry matches. The match is case-insensitive and exact. */
  findByName(name: string): T | undefined {
    const q = name.toLowerCase();
    return this.data.find((x) => x.name.toLowerCase() === q);
  }

  /** Returns the entries whose `name` contains `query`. The match is case-insensitive. The array is empty when no entry matches. */
  search(query: string): T[] {
    const q = query.toLowerCase();
    return this.data.filter((x) => x.name.toLowerCase().includes(q));
  }

  /** Returns the number of entries in the query. */
  count(): number {
    return this.data.length;
  }
}
