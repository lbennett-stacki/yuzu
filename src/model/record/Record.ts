export interface RecordI<T> {
  save(): Promise<RecordI<T>>;
  toObject(): T;
}

export interface RecordCollectionI<T> {
  save(): Promise<RecordCollectionI<T>>;
  toObject(): T[];
}
