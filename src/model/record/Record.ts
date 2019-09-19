export interface RecordInterface {
  save(): Promise<RecordInterface>;
  toPlain(): object;
}

// TODO: Add RecordCollectionInterface
