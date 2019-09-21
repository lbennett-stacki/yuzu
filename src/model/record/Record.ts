export interface RecordInterface<T> {
  save(): Promise<RecordInterface<T>>;
  toObject(): T;
}

// TODO: Add RecordCollectionInterface
