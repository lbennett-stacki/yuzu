export interface RecordI<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any; // TODO: improve. index should be limited to keyof T
  save(): Promise<RecordI<T>>;
  toObject(): T;
}

export abstract class Record<T> implements RecordI<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(record: any) {
    this.record = record;
  }

  abstract save(): Promise<RecordI<T>>;
  abstract toObject(): T;

  static proxyHandler<T>(): object {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get(obj: Record<T>, prop: string): any {
        return obj[prop] || obj.record[prop];
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      set(obj: Record<T>, prop: string, value: any): boolean {
        const base = obj[prop] ? obj : obj.record;
        base[prop] = value;
        return true;
      },
    };
  }
}

export interface RecordCollectionI<T> {
  save(): Promise<RecordCollectionI<T>>;
  toObject(): T[];
}
