export interface RecordI<T> {
  save(): Promise<RecordI<T>>;
  toObject(): T;
}

// TODO: Add RecordCollectionI
